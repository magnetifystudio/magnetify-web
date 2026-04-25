"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Chart ────────────────────────────────────────────────────────────────────
const SalesLineChart = ({ labels, data }: { labels: string[]; data: number[] }) => {
  const max = Math.max(...data, 1);
  const W = 100, H = 100;
  const pts = data.map((v, i) => ({
    x: data.length === 1 ? 50 : (i / (data.length - 1)) * W,
    y: H - (v / max) * H * 0.85 - H * 0.05,
  }));
  const pStr = pts.map(p => `${p.x},${p.y}`).join(" ");
  const fill = `M${pts[0].x},${pts[0].y} L${pStr} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  const shown = labels.filter((_, i) => labels.length <= 7 || i === 0 || i === Math.floor(labels.length/2) || i === labels.length-1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEDE00" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#FEDE00" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#cFill)"/>
        <polyline fill="none" stroke="#FEDE00" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" points={pStr}/>
      </svg>
      <div className="flex justify-between mt-1">
        {shown.map((l, i) => <span key={i} className="text-[8px] text-white/25">{l}</span>)}
      </div>
    </div>
  );
};

// ── Types ────────────────────────────────────────────────────────────────────
type Review = {
  id: string; order_id: string; product_id: string; customer_name: string;
  rating: number; feedback_text: string | null; created_at: string;
  magnetify_products?: { title_name: string; main_image: string };
};
type TimeFilter = 'today' | 'yesterday' | '7days' | '1month' | 'all';
type SalesFilter = 'today' | '7' | '15' | '30';

const REVIEWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [reviewTimeFilter, setReviewTimeFilter] = useState<TimeFilter>('7days');
  const [salesFilter, setSalesFilter] = useState<SalesFilter>('today');
  const [healthFilter, setHealthFilter] = useState<SalesFilter>('today');

  // Review pagination state
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(10);
  const [perPageDropOpen, setPerPageDropOpen] = useState(false);

  // Reset page when filter changes
  useEffect(() => { setReviewPage(1); }, [reviewTimeFilter, reviewsPerPage]);

  useEffect(() => {
    async function fetchData() {
      const [{ data: od }, { data: rd }, { data: pd }] = await Promise.all([
        supabase.from("customer_orders").select("*"),
        supabase.from("product_reviews").select(`*, magnetify_products(title_name, main_image)`).order("created_at", { ascending: false }),
        supabase.from("magnetify_products").select("id, title_name, stock, is_active"),
      ]);
      if (od) setOrders(od);
      if (rd) setReviews(rd as Review[]);
      if (pd) setProducts(pd);
    }
    fetchData();
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const getDateRange = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

  const filterOrdersByPeriod = (filter: SalesFilter) =>
    orders.filter(o => {
      if (o.status === 'cancelled') return false;
      if (filter === 'today') return o.created_at?.startsWith(today);
      return o.created_at >= getDateRange(Number(filter));
    });

  const getSalesTotal = (filter: SalesFilter) =>
    filterOrdersByPeriod(filter).reduce((a, o) => a + (Number(o.total_amount) || 0), 0);

  const getSalesChartData = (filter: SalesFilter) => {
    if (filter === 'today') {
      const hrs = [0,4,8,12,16,20];
      return {
        labels: hrs.map(h => `${h}:00`),
        data: hrs.map(h => orders.filter(o => {
          const d = new Date(o.created_at);
          return o.created_at?.startsWith(today) && d.getHours() >= h && d.getHours() < h+4;
        }).reduce((s, o) => s + (Number(o.total_amount)||0), 0))
      };
    }
    const days = Number(filter);
    return {
      labels: Array.from({length: days}, (_, i) => {
        const d = new Date(Date.now() - (days-1-i)*86400000);
        return d.toLocaleDateString('en-IN', {day:'numeric', month:'short'});
      }),
      data: Array.from({length: days}, (_, i) => {
        const ds = new Date(Date.now() - (days-1-i)*86400000).toISOString().split('T')[0];
        return orders.filter(o => o.created_at?.startsWith(ds) && o.status !== 'cancelled')
          .reduce((s, o) => s + (Number(o.total_amount)||0), 0);
      })
    };
  };

  const getFilteredReviews = (filter: TimeFilter): Review[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yest = new Date(Date.now()-86400000).toISOString().split('T')[0];
    switch (filter) {
      case 'today': return reviews.filter(r => r.created_at.startsWith(todayStr));
      case 'yesterday': return reviews.filter(r => r.created_at.startsWith(yest));
      case '7days': return reviews.filter(r => r.created_at >= getDateRange(7));
      case '1month': return reviews.filter(r => r.created_at >= getDateRange(30));
      default: return reviews;
    }
  };

  const getCancelledByPeriod = (filter: SalesFilter) => {
    const base = filter === 'today'
      ? orders.filter(o => o.created_at?.startsWith(today))
      : orders.filter(o => o.created_at >= getDateRange(Number(filter)));
    const cancelled = base.filter(o => o.status === 'cancelled');
    return {
      bySeller: cancelled.filter(o => o.cancel_reason === 'seller').length,
      byCustomer: cancelled.filter(o => o.cancel_reason !== 'seller').length,
      total: cancelled.length,
    };
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredSales = getSalesTotal(salesFilter);
  const chartData = getSalesChartData(salesFilter);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const unshippedOrders = orders.filter(o => o.fulfillment_status === 'pending' && o.payment_status === 'paid');

  const healthData = getCancelledByPeriod(healthFilter);
  const delayedOrders = orders.filter(o => o.is_delayed === true).length;

  const LOW_STOCK_THRESHOLD = 10;
  const lowStockProducts = products.filter(p => p.is_active && (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  const outOfStock = products.filter(p => p.is_active && (p.stock ?? 0) === 0).length;

  const filteredReviews = getFilteredReviews(reviewTimeFilter);
  const avgRating = reviews.length ? (reviews.reduce((s,r) => s+r.rating,0)/reviews.length).toFixed(1) : "5.0";
  const totalReviews = reviews.length;
  const negativeCount = reviews.filter(r => r.rating <= 2).length;
  const filteredAvg = filteredReviews.length
    ? (filteredReviews.reduce((s,r) => s+r.rating,0)/filteredReviews.length).toFixed(1) : "—";
  const ratingBreakdown = [5,4,3,2,1].map(star => ({
    star,
    count: filteredReviews.filter(r => r.rating === star).length,
    pct: filteredReviews.length ? Math.round(filteredReviews.filter(r => r.rating === star).length/filteredReviews.length*100) : 0,
  }));

  // Review pagination
  const reviewTotalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage);

  const TIME_FILTERS: {key: TimeFilter; label: string}[] = [
    {key:'today',label:'Today'},{key:'yesterday',label:'Yesterday'},
    {key:'7days',label:'7 Days'},{key:'1month',label:'1 Month'},{key:'all',label:'All Time'},
  ];

  const PERIOD_FILTERS: {key: SalesFilter; label: string}[] = [
    {key:'today',label:'Today'},{key:'7',label:'7D'},{key:'15',label:'15D'},{key:'30',label:'30D'},
  ];

  const panelCls = "bg-[#161616] border border-white/10 rounded-2xl overflow-hidden";
  const thCls = "px-4 py-2 text-left text-[9px] font-black uppercase tracking-widest text-white/25";
  const tdCls = "px-4 py-3 text-[11px]";

  const FilterTabs = ({ value, onChange }: { value: SalesFilter; onChange: (f: SalesFilter) => void }) => (
    <div className="px-4 pt-3 pb-2 flex gap-1.5 border-b border-white/5">
      {PERIOD_FILTERS.map(f => (
        <button key={f.key} onClick={() => onChange(f.key)}
          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            value === f.key ? 'bg-[#FEDE00]/20 text-[#FEDE00]' : 'text-white/30 hover:text-white/60'
          }`}>
          {f.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans" onClick={() => setPerPageDropOpen(false)}>

      {/* HEADER */}
      <div className="border-b border-white/5 px-8 py-6 flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-40">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Global Snapshot</h1>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Dashboard</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl border border-white/10 text-[11px] font-black uppercase text-white/40 hover:border-[#FEDE00]/40 hover:text-[#FEDE00] transition-all">
          ↻ Refresh
        </button>
      </div>

      <div className="px-8 py-6 space-y-4">

        {/* ── 4 CARDS ROW ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">

          {/* SALES */}
          <div className="flex flex-col gap-2">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#FEDE00]">
                  Sales <span className="text-white/20 normal-case font-normal">ⓘ</span>
                </p>
              </div>
              <p className="text-2xl font-black text-white">
                ₹{filteredSales.toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </p>
              <p className="text-[11px] text-white/30 mt-2 font-medium">
                {salesFilter === 'today' ? 'Today so far' : `Last ${salesFilter} days`}
              </p>
            </div>
            <div className={`${panelCls} flex-1 flex flex-col`}>
              <FilterTabs value={salesFilter} onChange={setSalesFilter} />
              <div className="px-4 pb-2 pt-3">
                <SalesLineChart labels={chartData.labels} data={chartData.data} />
              </div>
              <table className="w-full border-t border-white/5 mt-auto">
                <thead><tr className="border-b border-white/5">
                  <th className={thCls}>Marketplace</th>
                  <th className={thCls}>Sales</th>
                  <th className={thCls}>Units</th>
                </tr></thead>
                <tbody><tr>
                  <td className={`${tdCls} text-[#FEDE00] font-black`}>Magnetify India</td>
                  <td className={`${tdCls} text-white font-black`}>₹{filteredSales.toLocaleString('en-IN')}</td>
                  <td className={`${tdCls} text-white/60`}>{filterOrdersByPeriod(salesFilter).length}</td>
                </tr></tbody>
              </table>
            </div>
          </div>

          {/* OPEN ORDERS */}
          <div className="flex flex-col gap-2">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-4">Open Orders</p>
              <p className="text-2xl font-black text-white">{pendingOrders.length}</p>
              <p className="text-[11px] text-white/30 mt-2 font-medium">{pendingOrders.length} Pending Packing</p>
            </div>
            <div className={`${panelCls} flex-1 flex flex-col`}>
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/25">Open Orders Breakdown</p>
              </div>
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Count</th>
                </tr></thead>
                <tbody>
                  <tr className="border-b border-white/[0.04]">
                    <td className={`${tdCls} text-white/70`}>Pending Packing</td>
                    <td className={`${tdCls} text-blue-400 font-black`}>{pendingOrders.length}</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className={`${tdCls} text-white/70`}>Unshipped (Paid)</td>
                    <td className={`${tdCls} text-blue-400 font-black`}>{unshippedOrders.length}</td>
                  </tr>
                  <tr>
                    <td className={`${tdCls} text-white/70`}>In Production</td>
                    <td className={`${tdCls} text-blue-400 font-black`}>
                      {orders.filter(o => o.fulfillment_status === 'in_production').length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ACCOUNT HEALTH */}
          <div className="flex flex-col gap-2">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-green-400 mb-4">Account Health</p>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse ${delayedOrders > 0 ? 'bg-yellow-400' : 'bg-green-400'}`}/>
                <p className="text-2xl font-black text-white">{delayedOrders > 0 ? 'At Risk' : 'Healthy'}</p>
              </div>
              <p className="text-[11px] text-white/30 mt-2 font-medium">
                Canceled: {healthData.bySeller} (You) | {healthData.byCustomer} (User)
              </p>
            </div>
            <div className={`${panelCls} flex-1 flex flex-col`}>
              <FilterTabs value={healthFilter} onChange={setHealthFilter} />
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  <th className={thCls}>Type</th>
                  <th className={thCls}>Orders</th>
                </tr></thead>
                <tbody>
                  <tr className="border-b border-white/[0.04]">
                    <td className={`${tdCls} text-white/70`}>Cancelled by You</td>
                    <td className={`${tdCls} font-black ${healthData.bySeller > 0 ? 'text-red-400' : 'text-white/40'}`}>{healthData.bySeller}</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className={`${tdCls} text-white/70`}>Cancelled by User</td>
                    <td className={`${tdCls} font-black ${healthData.byCustomer > 0 ? 'text-yellow-400' : 'text-white/40'}`}>{healthData.byCustomer}</td>
                  </tr>
                  <tr>
                    <td className={`${tdCls} text-white/70`}>Total Cancelled</td>
                    <td className={`${tdCls} font-black text-white`}>{healthData.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PERFORMANCE */}
          <div className="flex flex-col gap-2">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-green-400 mb-4">Performance</p>
              <p className="text-2xl font-black text-white">Live</p>
              <p className="text-[11px] text-white/30 mt-2 font-medium">
                {outOfStock > 0 ? `⚠ ${outOfStock} Out of Stock` : '↑ Monitoring Growth'}
              </p>
            </div>
            <div className={`${panelCls} flex-1 flex flex-col`}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/25">Low Stock Alert</p>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  lowStockProducts.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-400'
                }`}>
                  {lowStockProducts.length > 0 ? `${lowStockProducts.length} items` : 'All Good'}
                </span>
              </div>
              {lowStockProducts.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[11px] text-white/20 font-black uppercase tracking-widest">No low stock items</p>
                </div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-white/5">
                      <th className={thCls}>Product</th>
                      <th className={thCls}>Stock</th>
                    </tr></thead>
                    <tbody>
                      {lowStockProducts.slice(0, 8).map((p, i) => (
                        <tr key={p.id} className={i < lowStockProducts.length-1 ? "border-b border-white/[0.04]" : ""}>
                          <td className={`${tdCls} text-white/70 max-w-[120px] truncate`} title={p.title_name}>{p.title_name}</td>
                          <td className={`${tdCls} font-black ${p.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                            {p.stock === 0 ? 'Out' : p.stock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SELLER FEEDBACK ── */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#FEDE00]">Seller Feedback</p>
                {negativeCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black">{negativeCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-base ${i <= Math.round(Number(avgRating)) ? 'text-[#FEDE00]' : 'text-white/10'}`}>★</span>
                  ))}
                </div>
                <span className="text-xl font-black text-white">{avgRating}</span>
                <span className="text-[11px] text-white/30">{totalReviews} total reviews</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5">
            {/* Time filter tabs */}
            <div className="flex border-b border-white/5 px-6">
              {TIME_FILTERS.map(({key, label}) => (
                <button key={key} onClick={() => setReviewTimeFilter(key)}
                  className={`px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[1px] ${
                    reviewTimeFilter === key ? 'border-[#FEDE00] text-[#FEDE00]' : 'border-transparent text-white/30 hover:text-white/60'
                  }`}>
                  {label}
                  <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full ${
                    reviewTimeFilter === key ? 'bg-[#FEDE00]/20 text-[#FEDE00]' : 'bg-white/5 text-white/20'
                  }`}>{getFilteredReviews(key).length}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
              {/* Rating breakdown */}
              <div className="p-6 border-r border-white/5">
                <div className="mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{filteredAvg}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${i <= Math.round(Number(filteredAvg === '—' ? 0 : filteredAvg)) ? 'text-[#FEDE00]' : 'text-white/10'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-white/30 mt-1">{filteredReviews.length} reviews in this period</p>
                </div>
                <div className="space-y-2">
                  {ratingBreakdown.map(({star, count, pct}) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 w-5 text-right font-black">{star}</span>
                      <span className={`text-[10px] ${star <= 2 ? 'text-red-400' : 'text-[#FEDE00]'}`}>★</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${star <= 2 ? 'bg-red-400' : star === 3 ? 'bg-yellow-400' : 'bg-[#FEDE00]'}`} style={{width:`${pct}%`}}/>
                      </div>
                      <span className="text-[10px] text-white/30 w-4 font-black">{count}</span>
                      <span className="text-[9px] text-white/15 w-7">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews list */}
              <div className="flex flex-col">
                {/* Reviews header with per-page dropdown */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/25">
                    Recent Reviews
                    {filteredReviews.length > 0 && (
                      <span className="ml-2 text-white/15 normal-case font-normal">
                        ({(reviewPage - 1) * reviewsPerPage + 1}–{Math.min(reviewPage * reviewsPerPage, filteredReviews.length)} of {filteredReviews.length})
                      </span>
                    )}
                  </p>

                  {/* Per-page dropdown */}
                  {filteredReviews.length > 0 && (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setPerPageDropOpen(o => !o)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-white/40 hover:border-white/20 hover:text-white/70 transition-all"
                      >
                        {reviewsPerPage} per page
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {perPageDropOpen && (
                        <div className="absolute top-full right-0 mt-1.5 bg-[#161616] border border-white/10 rounded-xl overflow-hidden z-30 shadow-2xl min-w-[130px]">
                          {REVIEWS_PER_PAGE_OPTIONS.map(n => (
                            <button
                              key={n}
                              onClick={() => { setReviewsPerPage(n); setPerPageDropOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-widest transition-all ${
                                reviewsPerPage === n
                                  ? 'bg-[#FEDE00] text-[#0A0A0A]'
                                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                              }`}
                            >
                              <span className={`w-3 text-center ${reviewsPerPage === n ? 'opacity-100' : 'opacity-0'}`}>✓</span>
                              {n} per page
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reviews list */}
                <div className="px-6 space-y-4 flex-1">
                  {paginatedReviews.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-white/20 font-black uppercase text-xs tracking-widest">No reviews in this period</p>
                    </div>
                  ) : paginatedReviews.map((review) => (
                    <div key={review.id} className="flex gap-3 pb-4 border-b border-white/[0.04] last:border-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                        {review.magnetify_products?.main_image
                          ? <img src={review.magnetify_products.main_image} alt="" className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-[8px] text-white/20">IMG</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-black text-white/80 line-clamp-1 uppercase tracking-tight">
                            {review.magnetify_products?.title_name || 'Product'}
                          </p>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {[1,2,3,4,5].map(i => (
                              <span key={i} className={`text-[11px] ${i <= review.rating ? 'text-[#FEDE00]' : 'text-white/10'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#FEDE00]/70 font-black">{review.customer_name || 'Anonymous'}</span>
                          <span className="text-white/10 text-[8px]">•</span>
                          <span className="text-[10px] text-white/25">
                            {new Date(review.created_at).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                          </span>
                        </div>
                        {review.feedback_text && (
                          <p className="text-[11px] text-white/40 mt-1.5 italic">"{review.feedback_text}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination footer */}
                {reviewTotalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 mt-2 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                      Page {reviewPage} of {reviewTotalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                        disabled={reviewPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black text-white/40 hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: Math.min(reviewTotalPages, 7) }, (_, i) => {
                        let page: number;
                        if (reviewTotalPages <= 7) page = i + 1;
                        else if (reviewPage <= 4) page = i + 1;
                        else if (reviewPage >= reviewTotalPages - 3) page = reviewTotalPages - 6 + i;
                        else page = reviewPage - 3 + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setReviewPage(page)}
                            className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                              reviewPage === page
                                ? 'bg-[#FEDE00] text-[#0A0A0A]'
                                : 'border border-white/10 text-white/30 hover:border-white/20 hover:text-white/60'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setReviewPage(p => Math.min(reviewTotalPages, p + 1))}
                        disabled={reviewPage === reviewTotalPages}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black text-white/40 hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
