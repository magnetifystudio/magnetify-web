"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Save, Plus, Trash2, ToggleLeft, ToggleRight, Megaphone, Sparkles, Loader2 } from "lucide-react";

export default function AnnouncementBarPage() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcement_bar")
      .select("*")
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleUpdate = async (id: string, text: string) => {
    setSaving(id);
    await supabase.from("announcement_bar").update({ text }).eq("id", id);
    setSaving(null);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    if (!currentStatus) {
      const { data: all } = await supabase.from("announcement_bar").select("id");
      if (all && all.length > 0) {
        const otherIds = all.map((a: any) => a.id).filter((aid: string) => aid !== id);
        if (otherIds.length > 0) {
          await supabase.from("announcement_bar").update({ is_active: false }).in("id", otherIds);
        }
      }
      await supabase.from("announcement_bar").update({ is_active: true }).eq("id", id);
    } else {
      await supabase.from("announcement_bar").update({ is_active: false }).eq("id", id);
    }
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await supabase.from("announcement_bar").delete().eq("id", id);
    fetchAnnouncements();
  };

  const handleAdd = async () => {
    if (!newText.trim()) return alert("Text required!");
    setAdding(true);
    await supabase.from("announcement_bar").insert([{ text: newText, is_active: false }]);
    setNewText("");
    fetchAnnouncements();
    setAdding(false);
  };

  const handleTextChange = (id: string, value: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, text: value } : a));
  };

  // ✅ Gemini API route use kar raha hai
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return alert("Pehle kuch likho — kya announce karna hai?");
    setAiLoading(true);
    setAiSuggestions([]);

    try {
      const prompt = `You are an expert copywriter for Magnetify Studio — an Indian e-commerce brand selling custom photo fridge magnets, acrylic frames, and personalized gifts.

Generate 3 short, punchy announcement bar texts based on this request: "${aiPrompt}"

Rules:
- Each announcement should be ONE line only
- Max 100 characters each
- Use | to separate multiple messages within one announcement
- Be concise, compelling, and relevant to an Indian audience
- Include Rs. for prices if mentioned
- Do NOT number them
- Return ONLY the 3 announcements, one per line, nothing else`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      const text = data.text || "";
      const lines = text.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      setAiSuggestions(lines.slice(0, 3));
    } catch {
      alert("AI generation failed. Try again!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseSuggestion = (text: string) => {
    setNewText(text);
    setAiSuggestions([]);
    setAiPrompt("");
  };

  const activeCount = announcements.filter(a => a.is_active).length;

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <p className="text-[#FEDE00] font-black uppercase tracking-widest text-xs animate-pulse">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">

      {/* HEADER */}
      <div className="border-b border-white/5 px-8 py-6 flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEDE00]/10 flex items-center justify-center">
            <Megaphone size={18} className="text-[#FEDE00]" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">Announcement Bar</h1>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Marketing & Growth</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase ${
          activeCount > 0
            ? "border-green-500/20 bg-green-500/5 text-green-400"
            : "border-white/10 bg-white/5 text-white/30"
        }`}>
          <div className={`w-2 h-2 rounded-full ${activeCount > 0 ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
          {activeCount > 0 ? "1 Live on Site" : "Nothing Active"}
        </div>
      </div>

      <div className="px-8 py-6 max-w-3xl">

        {/* INFO CARD */}
        <div className="bg-[#FEDE00]/5 border border-[#FEDE00]/20 rounded-2xl px-5 py-4 mb-6">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#FEDE00] mb-1">How it works</p>
          <p className="text-[12px] text-white/50 font-medium leading-relaxed">
            Only the <span className="text-white font-bold">Active</span> announcement will scroll on the website. Activating one will <span className="text-white font-bold">automatically deactivate</span> all others.
          </p>
        </div>

        {/* ANNOUNCEMENTS LIST */}
        <div className="space-y-4 mb-8">
          {announcements.length === 0 && (
            <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-white/20 font-black uppercase text-xs tracking-widest">No announcements yet</p>
            </div>
          )}

          {announcements.map((item) => (
            <div key={item.id}
              className={`bg-[#111111] border rounded-2xl p-5 transition-all ${
                item.is_active ? "border-[#FEDE00]/30" : "border-white/5"
              }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                  item.is_active
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-white/5 text-white/30 border-white/10"
                }`}>
                  {item.is_active ? "Active — Live on site" : "Inactive"}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(item.id, item.is_active)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border ${
                      item.is_active
                        ? "border-green-500/20 text-green-400 hover:bg-green-500/10"
                        : "border-[#FEDE00]/20 text-[#FEDE00] hover:bg-[#FEDE00]/10"
                    }`}>
                    {item.is_active
                      ? <><ToggleRight size={14} /> Deactivate</>
                      : <><ToggleLeft size={14} /> Activate</>
                    }
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-xl border border-white/5 text-white/20 hover:text-red-400 hover:border-red-500/20 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <textarea
                value={item.text}
                onChange={(e) => handleTextChange(item.id, e.target.value)}
                rows={2}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-[#FEDE00]/50 transition-all resize-none leading-relaxed"
                placeholder="Announcement text..."
              />

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => handleUpdate(item.id, item.text)}
                  disabled={saving === item.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FEDE00] text-black text-[10px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Save size={12} />
                  {saving === item.id ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ADD NEW */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Add New Announcement</p>

          {/* AI GENERATOR */}
          <div className="bg-[#FEDE00]/5 border border-[#FEDE00]/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[#FEDE00]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#FEDE00]">AI Generator</p>
            </div>
            <p className="text-[11px] text-white/40 mb-3">Kisi bhi language mein likho — AI announcement likh ke dega!</p>

            <div className="flex gap-2">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
                placeholder="e.g. Diwali sale 20% off, free delivery, new arrivals..."
                className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium outline-none focus:border-[#FEDE00]/50 transition-all"
              />
              <button
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[10px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-70 whitespace-nowrap"
              >
                {aiLoading
                  ? <><Loader2 size={12} className="animate-spin" /> Generating...</>
                  : <><Sparkles size={12} /> Generate</>
                }
              </button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Click to use:</p>
                {aiSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleUseSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-[12px] text-white/70 font-medium hover:border-[#FEDE00]/40 hover:text-white hover:bg-[#FEDE00]/5 transition-all"
                  >
                    <span className="text-[#FEDE00] font-black mr-2">{i + 1}.</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={2}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-[#FEDE00]/50 transition-all resize-none leading-relaxed mb-3"
            placeholder="Ya yahan seedha type karo..."
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[10px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Plus size={14} />
            {adding ? "Adding..." : "Add Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}
