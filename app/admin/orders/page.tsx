"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window { html2pdf: any; }
}

const COURIER_OPTIONS = [
  { id: "delhivery", name: "Delhivery", trackingUrl: "https://www.delhivery.com/tracking/{id}" },
  { id: "shiprocket", name: "Shiprocket", trackingUrl: "https://shiprocket.co/tracking/{id}" },
  { id: "dtdc",       name: "DTDC",       trackingUrl: "https://www.dtdc.in/tracking/{id}" },
  { id: "other",      name: "Other",      trackingUrl: "" },
];

function useHtml2Pdf() {
  useEffect(() => {
    if (typeof window === "undefined" || window.html2pdf) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);
}

type Order = {
  id: string;
  order_id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  mobile_number: string;
  shipping_address: string;
  cart_items: any[];
  item_count: number;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  transaction_id: string;
  payment_proof_path: string;
  payment_proof_content_type: string;
  payment_status: "awaiting_verification" | "paid";
  fulfillment_status: "pending" | "in_production" | "unshipped" | "shipped";
  rejection_note: string | null;
  status: string;
  tracking_id: string | null;
  notes: string | null;
  is_notified: boolean;
  courier_partner: string | null;
  courier_name: string | null;
  courier_tracking_url: string | null;
};

type OrderPhoto = {
  id: string;
  order_id: string;
  cart_item_id: string;
  product_id: string;
  product_title: string;
  variant_label: string;
  price: number;
  photo_urls: string[];
  created_at: string;
};

// ✅ "sent" instead of "shipped" in tab type
type ActiveTab = "pending" | "confirmed" | "unshipped" | "sent" | "all";
type DateRange = "today" | "3" | "7" | "15" | "30" | "all_time";
type SortKey = "date_asc" | "date_desc";

const DATE_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: "today",    label: "Today" },
  { key: "3",        label: "Last 3 days" },
  { key: "7",        label: "Last 7 days" },
  { key: "15",       label: "Last 15 days" },
  { key: "30",       label: "Last 30 days" },
  { key: "all_time", label: "All time" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "date_desc", label: "Order date (descending)" },
  { key: "date_asc",  label: "Order date (ascending)"  },
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function getDateCutoff(range: DateRange): Date | null {
  const now = new Date();
  if (range === "today") { const s = new Date(now); s.setHours(0,0,0,0); return s; }
  if (range === "all_time") return null;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - parseInt(range));
  return cutoff;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:               "bg-blue-400/10 border-blue-400/20 text-blue-400",
    awaiting_verification: "bg-[#FEDE00]/10 border-[#FEDE00]/20 text-[#FEDE00]",
    paid:                  "bg-green-400/10 border-green-400/20 text-green-400",
    in_production:         "bg-purple-400/10 border-purple-400/20 text-purple-400",
    unshipped:             "bg-orange-400/10 border-orange-400/20 text-orange-400",
    // ✅ both "shipped" (legacy) and "sent" (new) show green
    shipped:               "bg-green-400/10 border-green-400/20 text-green-400",
    sent:                  "bg-green-400/10 border-green-400/20 text-green-400",
    confirmed:             "bg-green-400/10 border-green-400/20 text-green-400",
    rejected:              "bg-red-400/10 border-red-400/20 text-red-400",
  };
  const cls = map[status] ?? "bg-white/5 border-white/10 text-white/40";
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function buildInvoiceHTML(order: Order): string {
  const invoiceNumber = "INV-" + order.id.slice(0, 8).toUpperCase();
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const deliveryCharge = order.delivery_charge || 49;
  const productPrice = (order.total_amount || 0) - deliveryCharge;
  const grandTotal = order.total_amount || 0;
  return `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;background:#fff;color:#000;">
      <div style="background:#000;padding:24px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="color:#fff;font-weight:900;font-size:20px;margin:0;letter-spacing:2px;">MAGNETIFY STUDIO</p>
          <p style="color:#aaa;font-size:11px;margin:4px 0 0;">Custom Photo Fridge Magnets</p>
          <p style="color:#aaa;font-size:11px;margin:2px 0 0;">Bangalore, Karnataka, India</p>
        </div>
        <div style="text-align:right;">
          <p style="color:#FEDE00;font-weight:900;font-size:22px;margin:0;">TAX INVOICE</p>
          <p style="color:#aaa;font-size:11px;margin:4px 0 0;">${invoiceNumber}</p>
          <p style="color:#aaa;font-size:11px;margin:2px 0 0;">${orderDate}</p>
        </div>
      </div>
      <div style="padding:24px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
          <div>
            <p style="font-size:10px;font-weight:900;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Bill To</p>
            <p style="font-weight:700;font-size:15px;margin:0 0 4px;">${order.customer_name}</p>
            <p style="font-size:12px;color:#555;margin:0 0 4px;white-space:pre-line;">${order.shipping_address}</p>
            <p style="font-size:12px;color:#555;margin:4px 0 0;">📞 ${order.mobile_number}</p>
            ${order.customer_email ? `<p style="font-size:12px;color:#555;margin:2px 0 0;">✉️ ${order.customer_email}</p>` : ""}
          </div>
          <div style="text-align:right;">
            <p style="font-size:10px;font-weight:900;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Invoice Details</p>
            <p style="font-size:11px;color:#888;margin:0;">Invoice No.</p>
            <p style="font-weight:700;margin:2px 0 8px;">${invoiceNumber}</p>
            <p style="font-size:11px;color:#888;margin:0;">Order Date</p>
            <p style="font-weight:500;font-size:13px;margin:2px 0 8px;">${orderDate}</p>
            <p style="font-size:11px;color:#888;margin:0;">Status</p>
            <span style="display:inline-block;background:#dcfce7;color:#166534;font-size:10px;padding:2px 8px;border-radius:12px;font-weight:700;text-transform:capitalize;margin-top:2px;">${order.status}</span>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="text-align:left;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;padding:8px 16px;">Description</th>
              <th style="text-align:center;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;padding:8px;">Qty</th>
              <th style="text-align:right;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;padding:8px 16px;">Unit Price</th>
              <th style="text-align:right;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;padding:8px 16px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:12px 16px;">
                <p style="font-weight:500;margin:0;">Magnetify Square: Custom Photo Fridge Magnets</p>
                <p style="font-size:11px;color:#888;margin:2px 0 0;">Personalized photo magnet</p>
              </td>
              <td style="text-align:center;padding:12px;font-size:13px;">1</td>
              <td style="text-align:right;padding:12px 16px;font-size:13px;">₹${productPrice}</td>
              <td style="text-align:right;padding:12px 16px;font-weight:500;">₹${productPrice}</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-bottom:24px;">
          <div style="width:200px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
              <span style="color:#666;">Sub Total</span><span>₹${productPrice}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
              <span style="color:#666;">Shipping Charges</span><span>₹${deliveryCharge}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900;border-top:2px solid #ddd;padding-top:8px;">
              <span>Grand Total</span><span style="color:#b45309;">₹${grandTotal}</span>
            </div>
          </div>
        </div>
        ${order.tracking_id ? `
        <div style="background:#f9f9f9;border-radius:8px;padding:12px;margin-bottom:16px;">
          <p style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin:0 0 6px;">Shipment Info</p>
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span>Courier: <strong>${order.courier_name || "—"}</strong></span>
            <span>Tracking: <strong style="font-family:monospace;">${order.tracking_id}</strong></span>
          </div>
        </div>` : ""}
        <div style="border-top:1px solid #eee;padding-top:16px;">
          <p style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin:0 0 6px;">Terms & Conditions</p>
          <p style="font-size:11px;color:#999;margin:2px 0;">• Goods once sold will not be taken back or exchanged.</p>
          <p style="font-size:11px;color:#999;margin:2px 0;">• This is a computer-generated invoice and does not require a signature.</p>
          <p style="font-size:11px;color:#999;margin:2px 0;">• Subject to local jurisdiction.</p>
        </div>
      </div>
      <div style="background:#000;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#666;font-size:11px;">Thank you for your purchase!</span>
        <span style="color:#FEDE00;font-size:11px;font-weight:700;">magnetify.studio</span>
      </div>
    </div>`;
}

function buildShippingLabelHTML(order: Order): string {
  const orderId = "#" + order.id.slice(0, 12).toUpperCase();
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const courierName = order.courier_name || "—";
  const trackingId = order.tracking_id || "—";
  return `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;background:#fff;color:#000;">
      <div style="background:#000;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="color:#fff;font-weight:900;font-size:20px;margin:0;letter-spacing:2px;">MAGNETIFY STUDIO</p>
          <p style="color:#aaa;font-size:11px;margin:4px 0 0;">Custom Photo Fridge Magnets</p>
        </div>
        <div style="text-align:right;">
          <p style="color:#aaa;font-size:11px;margin:0;">STANDARD SHIPPING</p>
          <p style="color:#FEDE00;font-weight:700;font-size:13px;margin:2px 0 0;">PREPAID</p>
        </div>
      </div>
      <div style="padding:24px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
          <div style="border:1px solid #ddd;border-radius:8px;padding:12px;">
            <p style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin:0 0 6px;">From (Sender)</p>
            <p style="font-weight:700;font-size:13px;margin:0 0 3px;">Magnetify Studio</p>
            <p style="font-size:12px;color:#666;margin:0;">Bangalore, Karnataka</p>
            <p style="font-size:12px;color:#666;margin:0;">India</p>
          </div>
          <div style="border:2px solid #000;border-radius:8px;padding:12px;">
            <p style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin:0 0 6px;">To (Receiver)</p>
            <p style="font-weight:700;font-size:13px;margin:0 0 4px;">${order.customer_name}</p>
            <p style="font-size:12px;color:#444;margin:0 0 4px;white-space:pre-line;">${order.shipping_address}</p>
            <p style="font-size:12px;color:#666;margin:4px 0 0;">📞 ${order.mobile_number}</p>
          </div>
        </div>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <p style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin:0 0 3px;">Courier Partner</p>
              <p style="font-weight:700;font-size:15px;margin:0;">${courierName}</p>
            </div>
            <div style="text-align:right;">
              <p style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin:0 0 3px;">Tracking ID</p>
              <p style="font-family:monospace;font-weight:700;font-size:15px;letter-spacing:2px;margin:0;">${trackingId}</p>
            </div>
          </div>
          ${order.tracking_id ? `
          <div style="text-align:center;border-top:1px solid #ccc;border-bottom:1px solid #ccc;padding:8px 0;margin-top:8px;">
            <span style="font-family:monospace;font-size:22px;font-weight:900;letter-spacing:6px;">${trackingId}</span>
          </div>` : ""}
        </div>
        <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:16px;">
          <div style="background:#f9f9f9;padding:8px 16px;display:flex;justify-content:space-between;">
            <span style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;">Order ID</span>
            <span style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;">Date</span>
          </div>
          <div style="padding:12px 16px;display:flex;justify-content:space-between;">
            <span style="font-family:monospace;font-size:13px;">${orderId}</span>
            <span style="font-size:13px;">${orderDate}</span>
          </div>
        </div>
        <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
          <div style="background:#f9f9f9;padding:8px 16px;">
            <span style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;">Items</span>
          </div>
          <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="font-weight:500;font-size:13px;margin:0 0 3px;">Magnetify Square: Custom Photo Fridge Magnets</p>
              <p style="font-size:11px;color:#888;margin:0;">Qty: 1</p>
            </div>
            <p style="font-weight:700;margin:0;">₹${order.total_amount || "—"}</p>
          </div>
        </div>
      </div>
      <div style="background:#f5f5f5;padding:10px 24px;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#888;font-size:11px;">This is a system-generated shipping label</span>
        <span style="color:#888;font-size:11px;">magnetify.studio</span>
      </div>
    </div>`;
}

async function generateAndDownloadPDF(htmlContent: string, filename: string, setStatus: (s: string) => void) {
  if (!window.html2pdf) {
    setStatus("⏳ Loading PDF engine, please try again in 2 seconds...");
    return;
  }
  setStatus("⏳ Generating PDF...");
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);
  try {
    await window.html2pdf()
      .set({ margin: 8, filename, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, logging: false }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } })
      .from(container.firstElementChild)
      .save();
    setStatus("✓ PDF downloaded!");
    setTimeout(() => setStatus(""), 3000);
  } catch {
    setStatus("❌ PDF generation failed. Try print button instead.");
  } finally {
    document.body.removeChild(container);
  }
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</p>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

function InfoBlock({ label, value, large, mono, full }: { label: string; value: string; large?: boolean; mono?: boolean; full?: boolean }) {
  return (
    <div className={`px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 ${full ? "col-span-2" : ""}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-1">{label}</p>
      <p className={`text-white/80 break-all ${large ? "text-xl font-black text-white" : mono ? "text-[12px] font-mono" : "text-[12px] font-medium"}`}>{value}</p>
    </div>
  );
}

function PhotoThumb({ url, index, filename }: { url: string; index: number; filename: string }) {
  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = filename; a.click();
      URL.revokeObjectURL(blobUrl);
    } catch { window.open(url, "_blank"); }
  }
  return (
    <div onClick={handleDownload} className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#FEDE00]/30 transition-all group relative cursor-pointer">
      <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-all text-center">
          <span className="text-white text-2xl block">↓</span>
          <span className="text-white text-[9px] font-black uppercase tracking-widest">Download</span>
        </div>
      </div>
      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[8px] text-white/60 font-black">#{index + 1}</div>
    </div>
  );
}

function OrderDrawer({ order, onClose, onRefresh }: { order: Order; onClose: () => void; onRefresh: () => void }) {
  const supabase = createClient();
  const [photos, setPhotos] = useState<OrderPhoto[]>([]);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState(order.tracking_id ?? "");
  const [courierPartner, setCourierPartner] = useState(order.courier_partner ?? "");
  const [otherCourierName, setOtherCourierName] = useState(order.courier_name ?? "");
  const [otherCourierUrl, setOtherCourierUrl] = useState(order.courier_tracking_url ?? "");
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => { fetchPhotos(); fetchPaymentScreenshot(); }, [order.id]);

  async function fetchPhotos() {
    const { data } = await supabase.from("order_photos").select("*").eq("order_id", order.id).order("created_at", { ascending: true });
    if (data) setPhotos(data as OrderPhoto[]);
  }

  async function fetchPaymentScreenshot() {
    if (!order.payment_proof_path) return;
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(order.payment_proof_path, 3600);
    if (data?.signedUrl) { setPaymentScreenshotUrl(data.signedUrl); setDebugInfo(null); }
    else setDebugInfo(`❌ Storage error: ${JSON.stringify(error)}`);
  }

  async function confirmPayment() {
    setLoading(true);
    const { error } = await supabase.from("customer_orders").update({ payment_status: "paid", fulfillment_status: "in_production", status: "confirmed" }).eq("id", order.id);
    if (!error) { setActionMsg("✓ Payment confirmed — order moved to In Production"); onRefresh(); }
    else setActionMsg("❌ Error: " + error.message);
    setLoading(false);
  }

  async function rejectPayment() {
    if (!rejectionNote.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("customer_orders").update({ payment_status: "awaiting_verification", rejection_note: rejectionNote, status: "rejected" }).eq("id", order.id);
    if (!error) { setActionMsg("Order marked as rejected with note."); setShowReject(false); onRefresh(); }
    else setActionMsg("❌ Error: " + error.message);
    setLoading(false);
  }

  async function markUnshipped() {
    setLoading(true);
    const { error } = await supabase.from("customer_orders").update({ fulfillment_status: "unshipped", status: "unshipped" }).eq("id", order.id);
    if (!error) { setActionMsg("✓ Order moved to Unshipped — ready to ship!"); onRefresh(); }
    else setActionMsg("❌ Error: " + error.message);
    setLoading(false);
  }

  // ✅ CHANGED: status → "sent", saves full tracking URL (no {id} left)
  async function markSent() {
    if (!trackingInput.trim()) { setActionMsg("⚠ Please enter a tracking ID first."); return; }
    if (!courierPartner) { setActionMsg("⚠ Please select a courier partner first."); return; }

    const courierName =
      courierPartner === "other"
        ? otherCourierName
        : COURIER_OPTIONS.find(c => c.id === courierPartner)?.name ?? "";

    const rawUrl =
      courierPartner === "other"
        ? otherCourierUrl
        : COURIER_OPTIONS.find(c => c.id === courierPartner)?.trackingUrl ?? "";

    // ✅ Store the full resolved URL (with tracking ID substituted)
    const resolvedTrackingUrl = rawUrl.replace("{id}", trackingInput.trim());

    if (courierPartner === "other" && !otherCourierName.trim()) {
      setActionMsg("⚠ Please enter the courier name."); return;
    }

    setLoading(true);
    const { error } = await supabase.from("customer_orders").update({
      tracking_id: trackingInput.trim(),
      courier_partner: courierPartner,
      courier_name: courierName,
      courier_tracking_url: resolvedTrackingUrl, // ✅ full URL saved
      fulfillment_status: "shipped",
      status: "sent",                             // ✅ canonical value is "sent"
    }).eq("id", order.id);

    if (!error) { setActionMsg("✓ Tracking ID saved — order marked as Sent!"); onRefresh(); }
    else setActionMsg("❌ Error: " + error.message);
    setLoading(false);
  }

  async function downloadSinglePhoto(url: string, filename: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = filename; a.click();
      URL.revokeObjectURL(blobUrl);
    } catch { window.open(url, "_blank"); }
  }

  async function downloadAllPhotos() {
    setActionMsg("⏳ Preparing ZIP download…");
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const customerName = order.customer_name.replace(/\s+/g, "_");
      let photoNum = 1;
      for (const photo of photos) {
        for (const url of (photo.photo_urls || [])) {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            const ext = blob.type.includes("png") ? "png" : "jpg";
            zip.file(`${customerName}_${order.order_id}_Photo${photoNum}.${ext}`, blob);
            photoNum++;
          } catch {}
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = `${customerName}_${order.order_id}_Photos.zip`; a.click();
      URL.revokeObjectURL(blobUrl);
      setActionMsg(`✓ Downloaded ${photoNum - 1} photos as ZIP!`);
    } catch {
      setActionMsg("❌ ZIP failed — downloading individually…");
      let photoNum = 1;
      for (const photo of photos) {
        for (const url of (photo.photo_urls || [])) {
          await downloadSinglePhoto(url, `${order.customer_name.replace(/\s+/g,"_")}_${order.order_id}_Photo${photoNum}.jpg`);
          photoNum++; await new Promise(r => setTimeout(r, 400));
        }
      }
    }
  }

  function downloadInvoice() {
    generateAndDownloadPDF(buildInvoiceHTML(order), `Invoice_${order.customer_name.replace(/\s+/g,"_")}_${order.order_id}.pdf`, (s) => setActionMsg(s));
  }

  function downloadShippingLabel() {
    generateAndDownloadPDF(buildShippingLabelHTML(order), `ShippingLabel_${order.customer_name.replace(/\s+/g,"_")}_${order.order_id}.pdf`, (s) => setActionMsg(s));
  }

  // ✅ check for both "sent" and legacy "shipped"
  const orderIsSent = order.status === "sent" || order.status === "shipped" || order.fulfillment_status === "shipped";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl h-screen bg-[#0D0D0D] border-l border-white/10 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/5 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Order Details</p>
            <p className="text-lg font-black text-[#FEDE00] mt-0.5">{order.order_id}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={order.status} />
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all">✕</button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {actionMsg && (
            <div className="px-4 py-3 rounded-xl bg-[#FEDE00]/10 border border-[#FEDE00]/20 text-[#FEDE00] text-[12px] font-black">{actionMsg}</div>
          )}

          {/* ── STAGE 1: PENDING ── */}
          {(order.payment_status === "awaiting_verification" || order.status === "pending") && (
            <section className="space-y-4">
              <SectionLabel label="Payment Verification" color="text-[#FEDE00]" />
              <div className="grid grid-cols-2 gap-3">
                <InfoBlock label="Amount Due" value={`₹${order.total_amount}`} large />
                <InfoBlock label="Transaction ID" value={order.transaction_id || "—"} mono />
              </div>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Payment Screenshot</p>
                  {paymentScreenshotUrl && (
                    <a href={paymentScreenshotUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-[#FEDE00] hover:underline uppercase tracking-widest">Open Full ↗</a>
                  )}
                </div>
                <div className="bg-black/30 flex items-center justify-center min-h-[200px]">
                  {paymentScreenshotUrl ? (
                    <img src={paymentScreenshotUrl} alt="Payment proof" className="max-h-[320px] object-contain w-full" />
                  ) : debugInfo ? (
                    <p className="text-red-400/70 text-[10px] font-mono px-4 text-center break-all leading-relaxed">{debugInfo}</p>
                  ) : (
                    <p className="text-white/20 text-[11px] font-black uppercase tracking-widest animate-pulse">Loading screenshot…</p>
                  )}
                </div>
              </div>
              {!showReject ? (
                <div className="flex gap-3">
                  <button onClick={confirmPayment} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#FEDE00] text-[#0A0A0A] text-[11px] font-black uppercase tracking-widest hover:bg-[#f5d400] transition-all shadow-[0_0_20px_rgba(254,222,0,0.2)] disabled:opacity-50">
                    {loading ? "Confirming…" : "✓ Confirm Payment"}
                  </button>
                  <button onClick={() => setShowReject(true)} className="px-5 py-3 rounded-xl border border-red-400/20 text-red-400 text-[11px] font-black uppercase tracking-widest hover:bg-red-400/5 transition-all">Reject</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea value={rejectionNote} onChange={(e) => setRejectionNote(e.target.value)} placeholder="Reason for rejection…" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white/80 placeholder:text-white/20 resize-none outline-none focus:border-red-400/40 transition-all" rows={3} />
                  <div className="flex gap-3">
                    <button onClick={rejectPayment} disabled={loading || !rejectionNote.trim()} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-400 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all disabled:opacity-40">
                      {loading ? "Rejecting…" : "Confirm Rejection"}
                    </button>
                    <button onClick={() => setShowReject(false)} className="px-5 py-3 rounded-xl border border-white/10 text-white/40 text-[11px] font-black uppercase tracking-widest hover:border-white/20 transition-all">Cancel</button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── STAGE 2: CONFIRMED ── */}
          {(order.status === "confirmed" || order.fulfillment_status === "in_production") && (
            <section className="space-y-4">
              <SectionLabel label="Uploaded Photos" color="text-purple-400" />
              {photos.length === 0 ? (
                <div className="py-10 rounded-xl border border-white/5 text-center">
                  <p className="text-white/20 text-[11px] font-black uppercase tracking-widest">No photos found in order_photos table</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.flatMap((photo, photoIdx) =>
                      (photo.photo_urls || []).map((url, idx) => {
                        const globalIdx = photos.slice(0, photoIdx).reduce((acc, p) => acc + (p.photo_urls || []).length, 0) + idx + 1;
                        return <PhotoThumb key={photo.id + "-" + idx} url={url} index={globalIdx - 1} filename={`${order.customer_name.replace(/\s+/g,"_")}_${order.order_id}_Photo${globalIdx}.jpg`} />;
                      })
                    )}
                  </div>
                  <button onClick={downloadAllPhotos} className="w-full py-3 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-400 text-[11px] font-black uppercase tracking-widest hover:bg-purple-500/30 transition-all">
                    ↓ Download All Photos ({photos.reduce((acc, p) => acc + (p.photo_urls || []).length, 0)})
                  </button>
                </>
              )}
              <button onClick={markUnshipped} disabled={loading} className="w-full py-3 rounded-xl bg-[#FEDE00] text-[#0A0A0A] text-[11px] font-black uppercase tracking-widest hover:bg-[#f5d400] transition-all shadow-[0_0_20px_rgba(254,222,0,0.15)] disabled:opacity-50">
                {loading ? "Moving…" : "Product Ready → Mark as Unshipped"}
              </button>
            </section>
          )}

          {/* ── STAGE 3: UNSHIPPED ── */}
          {(order.status === "unshipped" || order.fulfillment_status === "unshipped") && (
            <section className="space-y-4">
              <SectionLabel label="Shipping" color="text-orange-400" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={downloadInvoice} className="py-3 rounded-xl border border-white/10 text-white/60 text-[11px] font-black uppercase tracking-widest hover:border-white/20 hover:text-white/80 transition-all">
                  ⬇ Invoice PDF
                </button>
                <button onClick={downloadShippingLabel} className="py-3 rounded-xl border border-orange-400/20 text-orange-400 text-[11px] font-black uppercase tracking-widest hover:bg-orange-400/5 transition-all">
                  ⬇ Shipping Label PDF
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Courier Partner</p>
                <select value={courierPartner} onChange={(e) => setCourierPartner(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white outline-none focus:border-[#FEDE00]/40 transition-all appearance-none">
                  <option value="" className="bg-[#1a1a1a]">-- Select Courier --</option>
                  {COURIER_OPTIONS.map(c => <option key={c.id} value={c.id} className="bg-[#1a1a1a]">{c.name}</option>)}
                </select>
              </div>
              {courierPartner === "other" && (
                <div className="space-y-2">
                  <input value={otherCourierName} onChange={(e) => setOtherCourierName(e.target.value)} placeholder="Courier name (e.g. Blue Dart)…" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/40 transition-all" />
                  <input value={otherCourierUrl} onChange={(e) => setOtherCourierUrl(e.target.value)} placeholder="Tracking URL with {id} placeholder…" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/40 transition-all font-mono" />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Tracking ID</p>
                <div className="flex gap-2">
                  <input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="Enter courier tracking number…" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/40 transition-all font-mono" />
                  {/* ✅ calls markSent (not markShipped) */}
                  <button onClick={markSent} disabled={loading || !trackingInput.trim() || !courierPartner} className="px-6 py-3 rounded-xl bg-[#FEDE00] text-[#0A0A0A] text-[11px] font-black uppercase tracking-widest hover:bg-[#f5d400] transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(254,222,0,0.15)]">
                    {loading ? "…" : "Ship →"}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── STAGE 4: SENT ✅ (handles "sent" AND legacy "shipped") ── */}
          {orderIsSent && (
            <section className="space-y-4">
              <SectionLabel label="Sent ✓" color="text-green-400" />
              <div className="grid grid-cols-2 gap-3">
                <InfoBlock label="Courier" value={order.courier_name || "—"} />
                <InfoBlock label="Tracking ID" value={order.tracking_id || "—"} mono />
                <InfoBlock label="Amount Paid" value={`₹${order.total_amount}`} large />
              </div>

              {/* ✅ Live tracking link — uses the stored full URL directly */}
              {order.courier_tracking_url && (
                <a
                  href={order.courier_tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-400/5 border border-green-400/20 hover:bg-green-400/10 transition-all group"
                >
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-green-400/60">Live Tracking</p>
                    <p className="text-[12px] font-black text-green-400 mt-0.5">Track on {order.courier_name} ↗</p>
                  </div>
                  <span className="text-green-400/40 group-hover:text-green-400 text-lg transition-all">→</span>
                </a>
              )}

              <div className="px-4 py-3 rounded-xl bg-green-400/5 border border-green-400/20">
                <p className="text-green-400 text-[11px] font-black">✓ Order handed to courier. Customer can track via the track-order page.</p>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Re-download Documents</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={downloadInvoice} className="py-3 rounded-xl border border-white/10 text-white/50 text-[11px] font-black uppercase tracking-widest hover:border-white/20 hover:text-white/80 transition-all">
                    ⬇ Invoice
                  </button>
                  <button onClick={downloadShippingLabel} className="py-3 rounded-xl border border-green-400/20 text-green-400 text-[11px] font-black uppercase tracking-widest hover:bg-green-400/5 transition-all">
                    ⬇ Shipping Label
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── Always: Customer Info + Order Summary ── */}
          <section className="space-y-3">
            <SectionLabel label="Customer Info" color="text-white/40" />
            <div className="grid grid-cols-2 gap-3">
              <InfoBlock label="Name" value={order.customer_name} />
              <InfoBlock label="Mobile" value={order.mobile_number} mono />
              <InfoBlock label="Email" value={order.customer_email} />
              <InfoBlock label="Order Date" value={new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
            </div>
            <InfoBlock label="Shipping Address" value={order.shipping_address} full />
          </section>

          <section className="space-y-3">
            <SectionLabel label="Order Summary" color="text-white/40" />
            <div className="rounded-xl border border-white/5 overflow-hidden">
              {(order.cart_items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0">
                  {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white/80 truncate">{item.title || item.name || "Product"}</p>
                    <p className="text-[10px] text-white/30">Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="text-[12px] font-black text-white">₹{item.price || item.amount}</p>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-white/[0.02] border-t border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Delivery</span>
                <span className="text-[11px] font-black text-white/60">₹{order.delivery_charge}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-t border-white/5">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#FEDE00]">Total</span>
                <span className="text-[14px] font-black text-[#FEDE00]">₹{order.total_amount}</span>
              </div>
            </div>
          </section>

          {order.notes && (
            <section className="space-y-2">
              <SectionLabel label="Seller Notes" color="text-white/40" />
              <p className="text-[12px] text-white/50 italic px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">{order.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dropdown component ─────────────────────────────────────────────────────────
function FilterDropdown<T extends string>({
  label, options, value, onChange, open, onToggle,
}: {
  label: string;
  options: { key: T; label: string }[];
  value: T;
  onChange: (val: T) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const selected = options.find(o => o.key === value);
  return (
    <div className="relative">
      <button onClick={onToggle} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-white/[0.03] text-[11px] font-black uppercase tracking-widest text-white/60 hover:border-white/25 hover:text-white/80 transition-all">
        {selected?.label ?? label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-[#161616] border border-white/10 rounded-xl overflow-hidden z-30 shadow-2xl" style={{ minWidth: "max-content" }}>
          {options.map(opt => (
            <button key={opt.key} onClick={() => { onChange(opt.key); onToggle(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-widest transition-all ${value === opt.key ? "bg-[#FEDE00] text-[#0A0A0A]" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}>
              <span className={`w-3 text-center ${value === opt.key ? "opacity-100" : "opacity-0"}`}>✓</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [sortBy, setSortBy] = useState<SortKey>("date_desc");
  const [perPage, setPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [dateDropOpen, setDateDropOpen] = useState(false);
  const [sortDropOpen, setSortDropOpen] = useState(false);
  const [perPageDropOpen, setPerPageDropOpen] = useState(false);

  useHtml2Pdf();

  function closeAllDrops() { setDateDropOpen(false); setSortDropOpen(false); setPerPageDropOpen(false); }

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("customer_orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setCurrentPage(1); }, [activeTab, dateRange, sortBy, perPage]);

  useEffect(() => {
    function handleClick() { closeAllDrops(); }
    if (dateDropOpen || sortDropOpen || perPageDropOpen) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [dateDropOpen, sortDropOpen, perPageDropOpen]);

  const dateFiltered = orders.filter(o => {
    const cutoff = getDateCutoff(dateRange);
    if (!cutoff) return true;
    return new Date(o.created_at) >= cutoff;
  });

  // ✅ counts: "sent" tab counts both "sent" and legacy "shipped" rows
  const counts = {
    pending:   dateFiltered.filter(o => o.status === "pending" || o.payment_status === "awaiting_verification").length,
    confirmed: dateFiltered.filter(o => o.status === "confirmed" || o.fulfillment_status === "in_production").length,
    unshipped: dateFiltered.filter(o => o.status === "unshipped" || o.fulfillment_status === "unshipped").length,
    sent:      dateFiltered.filter(o => o.status === "sent" || o.status === "shipped" || o.fulfillment_status === "shipped").length,
    all:       dateFiltered.length,
  };

  const tabFiltered = activeTab === "all" ? dateFiltered : dateFiltered.filter(o => {
    if (activeTab === "pending")   return o.status === "pending" || o.payment_status === "awaiting_verification";
    if (activeTab === "confirmed") return o.status === "confirmed" || o.fulfillment_status === "in_production";
    if (activeTab === "unshipped") return o.status === "unshipped" || o.fulfillment_status === "unshipped";
    if (activeTab === "sent")      return o.status === "sent" || o.status === "shipped" || o.fulfillment_status === "shipped";
    return true;
  });

  const sortedFiltered = [...tabFiltered].sort((a, b) => {
    const tA = new Date(a.created_at).getTime();
    const tB = new Date(b.created_at).getTime();
    return sortBy === "date_asc" ? tA - tB : tB - tA;
  });

  const totalPages = Math.ceil(sortedFiltered.length / perPage);
  const filtered = sortedFiltered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ✅ "Shipped" → "Sent" in stat cards
  const statCards = [
    { key: "pending"   as ActiveTab, label: "Pending",   count: counts.pending,   sub: "Awaiting verification", accent: "text-[#FEDE00]",  glow: "shadow-[0_0_20px_rgba(254,222,0,0.08)]" },
    { key: "confirmed" as ActiveTab, label: "Confirmed", count: counts.confirmed, sub: "In production",         accent: "text-purple-400", glow: "" },
    { key: "unshipped" as ActiveTab, label: "Unshipped", count: counts.unshipped, sub: "Ready to ship",         accent: "text-orange-400", glow: counts.unshipped > 0 ? "shadow-[0_0_20px_rgba(251,146,60,0.1)]" : "" },
    { key: "sent"      as ActiveTab, label: "Sent",      count: counts.sent,      sub: "Delivered / in transit",accent: "text-green-400",  glow: "" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans" onClick={closeAllDrops}>
      {/* HEADER */}
      <div className="border-b border-white/5 px-8 py-5 flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-40">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Manage Orders</h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">Magnetify Studio / Orders</p>
        </div>
        <div className="flex items-center gap-3">
          {counts.pending > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-[#FEDE00]/10 border border-[#FEDE00]/20 text-[#FEDE00] text-[10px] font-black uppercase tracking-widest animate-pulse">
              {counts.pending} Need Verification
            </span>
          )}
          <button onClick={(e) => { e.stopPropagation(); fetchOrders(); }} className="px-5 py-2.5 rounded-xl border border-white/10 text-[11px] font-black uppercase text-white/40 hover:border-[#FEDE00]/40 hover:text-[#FEDE00] transition-all">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.key} onClick={() => setActiveTab(card.key)} className={`bg-[#111111] border rounded-2xl p-5 cursor-pointer transition-all hover:border-white/15 ${card.glow} ${activeTab === card.key ? "border-[#FEDE00]/30 bg-[#FEDE00]/[0.03]" : "border-white/5"}`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-white/40">{card.label}</p>
                {activeTab === card.key && <span className="w-1.5 h-1.5 rounded-full bg-[#FEDE00] mt-1" />}
              </div>
              <p className={`text-3xl font-black ${card.accent}`}>{card.count}</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-white/20">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-1">
            {/* ✅ tabs: "sent" instead of "shipped" */}
            {(["pending", "confirmed", "unshipped", "sent", "all"] as ActiveTab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[1px] ${activeTab === tab ? "border-[#FEDE00] text-[#FEDE00]" : "border-transparent text-white/30 hover:text-white/60"}`}>
                {tab}
                <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-[#FEDE00]/20 text-[#FEDE00]" : "bg-white/5 text-white/20"}`}>{counts[tab]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pb-1" onClick={(e) => e.stopPropagation()}>
            <FilterDropdown label="Date Range" options={DATE_RANGE_OPTIONS} value={dateRange} onChange={(v) => { setDateRange(v); closeAllDrops(); }} open={dateDropOpen} onToggle={() => { setDateDropOpen(o => !o); setSortDropOpen(false); setPerPageDropOpen(false); }} />
            <FilterDropdown label="Sort" options={SORT_OPTIONS} value={sortBy} onChange={(v) => { setSortBy(v); closeAllDrops(); }} open={sortDropOpen} onToggle={() => { setSortDropOpen(o => !o); setDateDropOpen(false); setPerPageDropOpen(false); }} />
            <FilterDropdown label="Per Page" options={PER_PAGE_OPTIONS.map(n => ({ key: n as any, label: `${n} per page` }))} value={perPage as any} onChange={(v) => { setPerPage(Number(v)); closeAllDrops(); }} open={perPageDropOpen} onToggle={() => { setPerPageDropOpen(o => !o); setDateDropOpen(false); setSortDropOpen(false); }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">{sortedFiltered.length} orders</span>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1fr] border-b border-white/5 px-6 py-3">
            {["Time", "Order ID", "Customer", "Amount", "Payment", "Status"].map((h) => (
              <p key={h} className="text-[9px] font-black uppercase tracking-widest text-white/25">{h}</p>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <p className="text-white/20 text-[11px] font-black uppercase tracking-widest animate-pulse">Loading orders…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-white/20 text-[12px] font-black uppercase tracking-widest">No orders in <span className="text-[#FEDE00]/40">{activeTab}</span></p>
              <p className="text-[11px] text-white/15 cursor-pointer hover:text-white/30 underline transition-all" onClick={() => setActiveTab("all")}>View all orders</p>
            </div>
          ) : (
            filtered.map((order) => (
              <div key={order.id} onClick={() => setSelectedOrder(order)} className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1fr] px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] cursor-pointer transition-all items-center group">
                <div>
                  <p className="text-[12px] font-black text-white">{new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#FEDE00] group-hover:underline">{order.order_id}</p>
                  <p className="text-[9px] text-white/20 mt-0.5 font-mono">{order.id.slice(0, 8)}…</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-white/80">{order.customer_name}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{order.mobile_number}</p>
                </div>
                <p className="text-[13px] font-black text-white">₹{order.total_amount}</p>
                <StatusPill status={order.payment_status} />
                <div className="flex items-center justify-between">
                  <StatusPill status={order.status} />
                  <span className="text-white/20 group-hover:text-white/60 transition-all text-[12px]">›</span>
                </div>
              </div>
            ))
          )}

          {!loading && totalPages > 1 && (
            <div className="border-t border-white/5 px-6 py-3 flex items-center justify-end gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black text-white/40 hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number;
                if (totalPages <= 7) page = i + 1;
                else if (currentPage <= 4) page = i + 1;
                else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                else page = currentPage - 3 + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === page ? "bg-[#FEDE00] text-[#0A0A0A]" : "border border-white/10 text-white/30 hover:border-white/20 hover:text-white/60"}`}>{page}</button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black text-white/40 hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onRefresh={() => {
            fetchOrders();
            supabase.from("customer_orders").select("*").eq("id", selectedOrder.id).single().then(({ data }) => { if (data) setSelectedOrder(data as Order); });
          }}
        />
      )}
    </div>
  );
}
