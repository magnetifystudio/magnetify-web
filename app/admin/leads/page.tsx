"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Mail, Phone, Download, Trash2, RefreshCw, Copy, Calendar, ChevronDown, X } from "lucide-react";

type Lead = {
  id: string;
  email: string | null;
  whatsapp: string | null;
  created_at: string;
};

type ContactFilter = "all" | "email" | "whatsapp";
type DateFilter = "all" | "today" | "yesterday" | "last7" | "month" | "custom";

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Pick a Date..." },
];

export default function PopupLeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [copyToast, setCopyToast] = useState("");

  const [contactFilter, setContactFilter] = useState<ContactFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDate, setCustomDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("popup_leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLeads(data || []);
    setSelected(new Set());
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filteredLeads = useMemo(() => {
    let result = [...leads];
    if (contactFilter === "email") result = result.filter(l => l.email);
    if (contactFilter === "whatsapp") result = result.filter(l => l.whatsapp);

    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (dateFilter === "today") {
      result = result.filter(l => new Date(l.created_at) >= startOfDay(now));
    } else if (dateFilter === "yesterday") {
      const start = startOfDay(new Date(now.getTime() - 86400000));
      const end = startOfDay(now);
      result = result.filter(l => new Date(l.created_at) >= start && new Date(l.created_at) < end);
    } else if (dateFilter === "last7") {
      result = result.filter(l => new Date(l.created_at) >= new Date(now.getTime() - 7 * 86400000));
    } else if (dateFilter === "month") {
      result = result.filter(l => new Date(l.created_at) >= new Date(now.getFullYear(), now.getMonth(), 1));
    } else if (dateFilter === "custom" && customDate) {
      const start = new Date(customDate);
      const end = new Date(customDate);
      end.setDate(end.getDate() + 1);
      result = result.filter(l => new Date(l.created_at) >= start && new Date(l.created_at) < end);
    }
    return result;
  }, [leads, contactFilter, dateFilter, customDate]);

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selected.has(l.id));
  const isIndeterminate = filteredLeads.some(l => selected.has(l.id)) && !isAllSelected;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelected(prev => { const n = new Set(prev); filteredLeads.forEach(l => n.delete(l.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filteredLeads.forEach(l => n.add(l.id)); return n; });
    }
  };

  const toggleOne = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectedLeads = leads.filter(l => selected.has(l.id));

  const handleDelete = async (id: string) => {
    if (!confirm("Is lead ko delete karna chahte ho?")) return;
    setDeleting(id);
    await supabase.from("popup_leads").delete().eq("id", id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    setDeleting(null);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selected.size} leads delete karna chahte ho?`)) return;
    setBulkDeleting(true);
    await supabase.from("popup_leads").delete().in("id", [...selected]);
    setLeads(prev => prev.filter(l => !selected.has(l.id)));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const exportToCSV = (rows: Lead[], filename: string) => {
    const csv = [["Email", "WhatsApp", "Date"], ...rows.map(l => [
      l.email || "", l.whatsapp || "",
      new Date(l.created_at).toLocaleString("en-IN"),
    ])].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = filename; a.click();
  };

  const showToast = (msg: string) => { setCopyToast(msg); setTimeout(() => setCopyToast(""), 2500); };

  const handleCopyEmails = () => {
    const emails = selectedLeads.map(l => l.email).filter(Boolean).join(", ");
    if (!emails) { showToast("Koi email nahi!"); return; }
    navigator.clipboard.writeText(emails);
    showToast(`${selectedLeads.filter(l => l.email).length} emails copied!`);
  };

  const handleCopyWhatsapp = () => {
    const numbers = selectedLeads.map(l => l.whatsapp).filter(Boolean).join(", ");
    if (!numbers) { showToast("Koi WhatsApp number nahi!"); return; }
    navigator.clipboard.writeText(numbers);
    showToast(`${selectedLeads.filter(l => l.whatsapp).length} numbers copied!`);
  };

  const getDateLabel = () => {
    if (dateFilter === "custom" && customDate)
      return new Date(customDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return DATE_OPTIONS.find(o => o.value === dateFilter)?.label ?? "All Time";
  };

  const hasFilters = contactFilter !== "all" || dateFilter !== "all";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">

      {copyToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#FEDE00] text-black text-[11px] font-black uppercase px-5 py-3 rounded-xl shadow-xl tracking-widest">
          {copyToast}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/5 px-8 py-6 sticky top-0 bg-[#0A0A0A] z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Popup Leads</h1>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Marketing</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchLeads}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[11px] font-black uppercase">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={() => exportToCSV(filteredLeads, `popup-leads-${Date.now()}.csv`)} disabled={filteredLeads.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[11px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-30">
              <Download size={13} /> {hasFilters ? "Export Filtered" : "Export All"}
            </button>
          </div>
        </div>

        {/* ── Filter Row ── */}
        <div className="flex items-center gap-3 mt-5 flex-wrap">

          {/* Contact filter pills */}
          {[
            { value: "all" as ContactFilter, label: `${leads.length} Total`, color: "yellow" },
            { value: "email" as ContactFilter, label: `${leads.filter(l=>l.email).length} Emails`, color: "blue" },
            { value: "whatsapp" as ContactFilter, label: `${leads.filter(l=>l.whatsapp).length} WhatsApp`, color: "green" },
          ].map(({ value, label, color }) => {
            
            // TypeScript fix for undefined colors
            const colorMap: Record<string, { active: string; inactive: string }> = {
              yellow: { active: "bg-[#FEDE00]/15 border-[#FEDE00]/40 text-[#FEDE00]", inactive: "text-white/40 border-white/10" },
              blue:   { active: "bg-blue-500/15 border-blue-500/40 text-blue-400",    inactive: "text-white/40 border-white/10" },
              green:  { active: "bg-green-500/15 border-green-500/40 text-green-400", inactive: "text-white/40 border-white/10" },
            };
            const colors = colorMap[color] ?? { active: "", inactive: "" };

            return (
              <button key={value} onClick={() => setContactFilter(contactFilter === value && value !== "all" ? "all" : value)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 border text-[11px] font-black uppercase tracking-widest transition-all ${
                  contactFilter === value ? colors.active : `bg-white/5 ${colors.inactive} hover:border-white/20`
                }`}>
                {value === "email" && <Mail size={11} />}
                {value === "whatsapp" && <Phone size={11} />}
                {label}
                {contactFilter === value && value !== "all" && <X size={10} className="ml-0.5" />}
              </button>
            );
          })}

          <div className="w-px h-6 bg-white/10" />

          {/* ── Date Dropdown ── */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all ${
                dateFilter !== "all"
                  ? "bg-white/15 border-white/30 text-white"
                  : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
              }`}>
              <Calendar size={12} />
              {getDateLabel()}
              {dateFilter !== "all"
                ? <X size={10} className="ml-0.5" onClick={(e) => { e.stopPropagation(); setDateFilter("all"); setCustomDate(""); setDropdownOpen(false); }} />
                : <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              }
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-[#161616] border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-w-[180px]">
                {DATE_OPTIONS.filter(o => o.value !== "custom").map(opt => (
                  <button key={opt.value}
                    onClick={() => { setDateFilter(opt.value); setCustomDate(""); setDropdownOpen(false); }}
                    className={`w-full text-left px-5 py-3 text-[12px] font-bold transition-all flex items-center justify-between ${
                      dateFilter === opt.value
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}>
                    {opt.label}
                    {dateFilter === opt.value && <span className="text-[#FEDE00] text-[10px]">✓</span>}
                  </button>
                ))}

                <div className="border-t border-white/5 mx-3 my-1" />

                <div className="px-4 pb-4 pt-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2">Specific Date</p>
                  <input type="date" value={customDate}
                    max={new Date().toISOString().split("T")[0]}
                    ref={dateInputRef}
                    onChange={(e) => { setCustomDate(e.target.value); setDateFilter("custom"); setDropdownOpen(false); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[12px] focus:outline-none focus:border-[#FEDE00]/40 transition-all"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            )}
          </div>

          {hasFilters && (
            <button onClick={() => { setContactFilter("all"); setDateFilter("all"); setCustomDate(""); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
              <X size={10} /> Clear
            </button>
          )}
        </div>

        {hasFilters && (
          <p className="mt-3 text-[11px] text-white/30">
            Showing <span className="text-[#FEDE00] font-black">{filteredLeads.length}</span> of {leads.length} leads
          </p>
        )}
      </div>

      <div className="px-8 py-6">

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-[#FEDE00]/10 border border-[#FEDE00]/20 rounded-2xl px-5 py-3 flex-wrap">
            <span className="text-[#FEDE00] font-black text-sm mr-2">{selected.size} selected</span>
            <button onClick={handleCopyEmails} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-black uppercase hover:bg-blue-500/20 transition-all">
              <Copy size={12} /> Copy Emails
            </button>
            <button onClick={handleCopyWhatsapp} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-black uppercase hover:bg-green-500/20 transition-all">
              <Copy size={12} /> Copy WhatsApp
            </button>
            <button onClick={() => exportToCSV(selectedLeads, `selected-leads-${Date.now()}.csv`)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FEDE00]/10 border border-[#FEDE00]/20 text-[#FEDE00] text-[11px] font-black uppercase hover:bg-[#FEDE00]/20 transition-all">
              <Download size={12} /> Export Selected
            </button>
            <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-black uppercase hover:bg-red-500/20 transition-all disabled:opacity-50">
              <Trash2 size={12} /> {bulkDeleting ? "Deleting..." : "Delete Selected"}
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-white/30 hover:text-white text-[11px] font-black uppercase transition-colors">✕ Clear</button>
          </div>
        )}

        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[48px_40px_1fr_1fr_160px_60px] gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center">
              <button onClick={toggleAll}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isAllSelected ? "bg-[#FEDE00] border-[#FEDE00]"
                  : isIndeterminate ? "bg-[#FEDE00]/30 border-[#FEDE00]/60"
                  : "border-white/20 hover:border-white/40"
                }`}>
                {isAllSelected && <span className="text-black text-[10px] font-black">✓</span>}
                {isIndeterminate && <span className="text-[#FEDE00] text-[10px] font-black">—</span>}
              </button>
            </div>
            {["#", "Email", "WhatsApp", "Date", ""].map((h, i) => (
              <div key={i} className="text-[9px] font-black uppercase tracking-widest text-white/25">{h}</div>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#FEDE00] font-black uppercase text-xs tracking-widest animate-pulse">Loading Leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-white/20 font-black uppercase text-xs tracking-widest">{leads.length === 0 ? "No leads yet" : "No leads match filters"}</p>
              <p className="text-white/10 text-[11px] mt-2">{leads.length === 0 ? "Leads will appear when users submit the popup" : "Try changing or clearing the filters"}</p>
            </div>
          ) : (
            filteredLeads.map((lead, idx) => {
              const isChecked = selected.has(lead.id);
              return (
                <div key={lead.id}
                  className={`grid grid-cols-[48px_40px_1fr_1fr_160px_60px] gap-4 px-6 py-4 border-b border-white/[0.04] items-center transition-all ${isChecked ? "bg-[#FEDE00]/5" : "hover:bg-white/[0.02]"}`}>
                  <div className="flex items-center">
                    <button onClick={() => toggleOne(lead.id)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? "bg-[#FEDE00] border-[#FEDE00]" : "border-white/20 hover:border-white/40"}`}>
                      {isChecked && <span className="text-black text-[10px] font-black">✓</span>}
                    </button>
                  </div>
                  <div className="text-[11px] font-black text-white/20">{filteredLeads.length - idx}</div>
                  <div className="flex items-center gap-2">
                    {lead.email
                      ? <><Mail size={13} className="text-blue-400 flex-shrink-0" /><a href={`mailto:${lead.email}`} className="text-[13px] font-medium text-white/70 hover:text-blue-400 transition-colors truncate">{lead.email}</a></>
                      : <span className="text-white/15 text-[11px] font-bold">—</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.whatsapp
                      ? <><Phone size={13} className="text-green-400 flex-shrink-0" /><a href={`https://wa.me/${lead.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-white/70 hover:text-green-400 transition-colors">{lead.whatsapp}</a></>
                      : <span className="text-white/15 text-[11px] font-bold">—</span>}
                  </div>
                  <div className="text-[11px] text-white/30 font-medium">
                    {new Date(lead.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => handleDelete(lead.id)} disabled={deleting === lead.id}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}