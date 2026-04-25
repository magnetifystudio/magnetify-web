"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useReactToPrint } from "react-to-print";

declare global {
  interface Window {
    html2pdf: any;
  }
}

const COURIER_OPTIONS = [
  { id: "delhivery", name: "Delhivery", trackingUrl: "https://www.delhivery.com/tracking/{id}" },
  { id: "shiprocket", name: "Shiprocket", trackingUrl: "https://shiprocket.co/tracking/{id}" },
  { id: "dtdc", name: "DTDC", trackingUrl: "https://www.dtdc.in/tracking/{id}" },
  { id: "other", name: "Other", trackingUrl: "" },
];

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  tracking_id: string;
  courier_partner: string;
  courier_tracking_url: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: { name: string; qty: number; price: number }[];
};

export default function ShippingLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Courier fields
  const [selectedCourier, setSelectedCourier] = useState("");
  const [otherCourierName, setOtherCourierName] = useState("");
  const [otherCourierUrl, setOtherCourierUrl] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const printRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const handlePrint = useReactToPrint({ contentRef: printRef });
  const searchParams = useSearchParams();
  const [downloading, setDownloading] = useState(false);

  // Load html2pdf script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.html2pdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  async function handleDownloadPDF() {
    if (!printRef.current || !window.html2pdf) return;
    setDownloading(true);
    const filename = `ShippingLabel_${order?.customer_name?.replace(/\s+/g, "_")}_${order?.id?.slice(0, 8).toUpperCase()}.pdf`;
    await window.html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(printRef.current)
      .save();
    setDownloading(false);
  }

  // Auto-trigger print when ?print=true
  useEffect(() => {
    if (searchParams.get("print") === "true" && !loading && order) {
      setTimeout(() => { handlePrint(); }, 600);
    }
  }, [loading, order, searchParams]);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    const { data, error } = await supabase
      .from("customer_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setOrder(data);
      setTrackingId(data.tracking_id || "");
      setSelectedCourier(data.courier_partner || "");
      if (data.courier_partner === "other") {
        setOtherCourierName(data.courier_name || "");
        setOtherCourierUrl(data.courier_tracking_url || "");
      }
    }
    setLoading(false);
  }

  function getTrackingUrl() {
    if (selectedCourier === "other") return otherCourierUrl;
    const courier = COURIER_OPTIONS.find((c) => c.id === selectedCourier);
    return courier?.trackingUrl.replace("{id}", trackingId) || "";
  }

  function getCourierDisplayName() {
    if (selectedCourier === "other") return otherCourierName;
    return COURIER_OPTIONS.find((c) => c.id === selectedCourier)?.name || "";
  }

  async function saveCourierDetails() {
    setSaving(true);
    const courierName = getCourierDisplayName();
    const trackingUrl = getTrackingUrl();

    const { error } = await supabase
      .from("customer_orders")
      .update({
        tracking_id: trackingId,
        courier_partner: selectedCourier,
        courier_name: courierName,
        courier_tracking_url: trackingUrl,
      })
      .eq("id", id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      fetchOrder();
    }
  }

  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">Order not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Courier Details Form (not printed) */}
      <div className="max-w-2xl mx-auto mb-6 bg-gray-800 rounded-xl p-5 print:hidden">
        <h2 className="text-white font-bold text-lg mb-4">Courier Details</h2>

        <div className="space-y-4">
          {/* Courier Partner Select */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Courier Partner</label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-yellow-400"
            >
              <option value="">-- Select Courier --</option>
              {COURIER_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Other courier name + URL */}
          {selectedCourier === "other" && (
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Courier Name</label>
                <input
                  type="text"
                  value={otherCourierName}
                  onChange={(e) => setOtherCourierName(e.target.value)}
                  placeholder="e.g. Blue Dart"
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Tracking URL (use {"{id}"} as placeholder)
                </label>
                <input
                  type="text"
                  value={otherCourierUrl}
                  onChange={(e) => setOtherCourierUrl(e.target.value)}
                  placeholder="https://courier.com/track/{id}"
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          )}

          {/* Tracking ID */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Tracking ID</label>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Tracking URL preview */}
          {trackingId && selectedCourier && (
            <div className="bg-gray-700 rounded-lg px-3 py-2">
              <p className="text-gray-400 text-xs mb-1">Tracking Link:</p>
              <a
                href={getTrackingUrl()}
                target="_blank"
                rel="noreferrer"
                className="text-yellow-400 text-sm break-all hover:underline"
              >
                {getTrackingUrl()}
              </a>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={saveCourierDetails}
              disabled={saving}
              className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Courier Details"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-500 transition disabled:opacity-50"
            >
              {downloading ? "⏳ Generating..." : "⬇️ Download PDF"}
            </button>
            <button
              onClick={() => handlePrint()}
              className="flex-1 bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition"
            >
              🖨️ Print Label
            </button>
          </div>
        </div>
      </div>

      {/* SHIPPING LABEL (printable) */}
      <div
        ref={printRef}
        className="max-w-2xl mx-auto bg-white text-black rounded-xl overflow-hidden"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="bg-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Magnetify Studio"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <p className="text-white font-black text-xl tracking-wide">MAGNETIFY STUDIO</p>
              <p className="text-gray-400 text-xs">Custom Photo Fridge Magnets</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">STANDARD SHIPPING</p>
            <p className="text-yellow-400 font-bold text-sm">PREPAID</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* FROM / TO */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* FROM */}
            <div className="border border-gray-300 rounded-lg p-3">
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase">From (Sender)</p>
              <p className="font-bold text-sm">Magnetify Studio</p>
              <p className="text-sm text-gray-600">Bangalore, Karnataka</p>
              <p className="text-sm text-gray-600">India</p>
            </div>
            {/* TO */}
            <div className="border-2 border-black rounded-lg p-3">
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase">To (Receiver)</p>
              <p className="font-bold text-sm">{order.customer_name}</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
              <p className="text-sm text-gray-600 mt-1">📞 {order.customer_phone}</p>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Courier Partner</p>
                <p className="font-bold text-base">{getCourierDisplayName() || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-bold">Tracking ID</p>
                <p className="font-mono font-bold text-base tracking-wider">
                  {trackingId || "—"}
                </p>
              </div>
            </div>

            {/* Barcode-style tracking ID display */}
            {trackingId && (
              <div className="mt-2 text-center">
                <div className="font-mono text-2xl font-black tracking-[0.3em] border-t border-b border-gray-400 py-2">
                  {trackingId}
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div className="bg-gray-50 px-4 py-2 flex justify-between text-xs font-bold text-gray-500 uppercase">
              <span>Order ID</span>
              <span>Date</span>
            </div>
            <div className="px-4 py-3 flex justify-between">
              <span className="font-mono text-sm">#{order.id.slice(0, 12).toUpperCase()}</span>
              <span className="text-sm">{orderDate}</span>
            </div>
          </div>

          {/* Product */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase">
              Items
            </div>
            <div className="px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">Magnetify Square: Custom Photo Fridge Magnets</p>
                  <p className="text-xs text-gray-500">Qty: 1</p>
                </div>
                <p className="font-bold">₹{order.total_amount || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 flex justify-between items-center text-xs text-gray-500">
          <span>This is a system-generated shipping label</span>
          <span>magnetify.studio</span>
        </div>
      </div>
    </div>
  );
}
