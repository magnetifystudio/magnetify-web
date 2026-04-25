"use client";

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

// ── Always-Visible Price Cell ─────────────────────────────────────────────────
export function InlineEditCell({
  value,
  productId,
  field,
  onSave,
  prefix = '',
  className = '',
}: {
  value: any;
  productId: string;
  field: string;
  onSave: (id: string, field: string, val: any) => Promise<void>;
  prefix?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value ?? ''));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(String(value ?? ''));
    setDirty(false);
  }, [value]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    setDirty(e.target.value !== String(value ?? ''));
  };

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    await onSave(productId, field, isNaN(Number(draft)) ? draft : Number(draft));
    setSaving(false);
    setDirty(false);
  };

  const cancel = () => {
    setDraft(String(value ?? ''));
    setDirty(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-1 rounded-lg px-2 py-1.5 border transition-all ${
        dirty
          ? 'bg-[#1a1a1a] border-[#FEDE00]/70 shadow-[0_0_8px_rgba(254,222,0,0.15)]'
          : 'bg-[#161616] border-white/15 hover:border-white/30'
      }`}>
        {prefix && <span className="text-[#FEDE00]/70 text-xs font-black select-none">{prefix}</span>}
        <input
          value={draft}
          onChange={onChange}
          onKeyDown={onKey}
          className="bg-transparent text-[#FEDE00] font-black text-sm outline-none w-16"
          type="number"
          style={{ MozAppearance: 'textfield' } as any}
        />
      </div>
      {dirty && (
        <>
          <button onClick={save} disabled={saving}
            className="p-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/40 transition-all border border-green-500/30 flex-shrink-0">
            <Check size={11} strokeWidth={3} />
          </button>
          <button onClick={cancel}
            className="p-1 rounded-lg bg-white/5 text-white/30 hover:bg-white/15 transition-all border border-white/10 flex-shrink-0">
            <X size={11} strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  );
}

// ── Always-Visible Stock Cell ─────────────────────────────────────────────────
export function InlineStockCell({
  value,
  productId,
  onSave,
}: {
  value: any;
  productId: string;
  onSave: (id: string, field: string, val: any) => Promise<void>;
}) {
  const [draft, setDraft] = useState(String(value ?? ''));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(String(value ?? ''));
    setDirty(false);
  }, [value]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    setDirty(e.target.value !== String(value ?? ''));
  };

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    await onSave(productId, 'stock', Number(draft));
    setSaving(false);
    setDirty(false);
  };

  const cancel = () => {
    setDraft(String(value ?? ''));
    setDirty(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  const num = Number(value);

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center rounded-lg px-2 py-1.5 border transition-all ${
        dirty
          ? 'bg-[#1a1a1a] border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.05)]'
          : 'bg-[#161616] border-white/15 hover:border-white/30'
      }`}>
        <input
          value={draft}
          onChange={onChange}
          onKeyDown={onKey}
          className={`bg-transparent font-black text-sm outline-none w-12 text-center ${
            num > 0 ? 'text-green-400' : 'text-red-400'
          }`}
          type="number"
          style={{ MozAppearance: 'textfield' } as any}
        />
      </div>
      {dirty && (
        <>
          <button onClick={save} disabled={saving}
            className="p-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/40 transition-all border border-green-500/30 flex-shrink-0">
            <Check size={11} strokeWidth={3} />
          </button>
          <button onClick={cancel}
            className="p-1 rounded-lg bg-white/5 text-white/30 hover:bg-white/15 transition-all border border-white/10 flex-shrink-0">
            <X size={11} strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  );
}
