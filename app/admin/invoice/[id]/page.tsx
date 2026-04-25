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

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  tracking_id: string;
  courier_name: string;
  total_amount: number;
  delivery_charges: number;
  status: string;
  created_at: string;
};

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
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
    const filename = `Invoice_${order?.customer_name?.replace(/\s+/g, "_")}_${invoiceNumber}.pdf`;
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
    async function fetchOrder() {
      const { data } = await supabase
        .from("customer_orders")
        .select("*")
        .eq("id", id)
        .single();
      setOrder(data);
      setLoading(false);
    }
    fetchOrder();
  }, []);

  const invoiceNumber = order?.id
    ? "INV-" + order.id.slice(0, 8).toUpperCase()
    : "";

  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const productPrice = order
    ? (order.total_amount || 0) - (order.delivery_charges || 49)
    : 0;
  const deliveryCharges = order?.delivery_charges || 49;
  const grandTotal = order?.total_amount || 0;

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
      {/* Action Buttons */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-end gap-3 print:hidden">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {downloading ? "⏳ Generating PDF..." : "⬇️ Download PDF"}
        </button>
        <button
          onClick={() => handlePrint()}
          className="bg-gray-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-gray-500 transition"
        >
          🖨️ Print Invoice
        </button>
      </div>

      {/* INVOICE (printable) */}
      <div
        ref={printRef}
        className="max-w-2xl mx-auto bg-white text-black rounded-xl overflow-hidden"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="bg-black p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <p className="text-gray-400 text-xs">Bangalore, Karnataka, India</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-black text-2xl">TAX INVOICE</p>
            <p className="text-gray-400 text-xs mt-1">{invoiceNumber}</p>
            <p className="text-gray-400 text-xs">{orderDate}</p>
          </div>
        </div>

        {/* Bill To + Invoice Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Bill To</p>
              <p className="font-bold text-base">{order.customer_name}</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
              <p className="text-sm text-gray-600 mt-1">📞 {order.customer_phone}</p>
              {order.customer_email && (
                <p className="text-sm text-gray-600">✉️ {order.customer_email}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Invoice Details</p>
              <div className="space-y-1">
                <div>
                  <p className="text-xs text-gray-500">Invoice No.</p>
                  <p className="font-bold">{invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="font-medium text-sm">{orderDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-4 border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-2">
                  Description
                </th>
                <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-2">
                  Qty
                </th>
                <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-2">
                  Unit Price
                </th>
                <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-2">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <p className="font-medium">Magnetify Square: Custom Photo Fridge Magnets</p>
                  <p className="text-xs text-gray-500">Personalized photo magnet</p>
                </td>
                <td className="text-center px-4 py-3 text-sm">1</td>
                <td className="text-right px-4 py-3 text-sm">₹{productPrice}</td>
                <td className="text-right px-4 py-3 font-medium">₹{productPrice}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-56 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sub Total</span>
                <span>₹{productPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Charges</span>
                <span>₹{deliveryCharges}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between font-black text-base">
                <span>Grand Total</span>
                <span className="text-yellow-600">₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.tracking_id && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Shipment Info</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Courier: <span className="font-medium text-black">{order.courier_name || "—"}</span>
                </span>
                <span className="text-gray-600">
                  Tracking: <span className="font-mono font-bold text-black">{order.tracking_id}</span>
                </span>
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Terms & Conditions</p>
            <ul className="text-xs text-gray-500 space-y-0.5">
              <li>• Goods once sold will not be taken back or exchanged.</li>
              <li>• This is a computer-generated invoice and does not require a signature.</li>
              <li>• Subject to local jurisdiction.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black px-6 py-3 flex justify-between items-center">
          <span className="text-gray-500 text-xs">Thank you for your purchase!</span>
          <span className="text-yellow-400 text-xs font-bold">magnetify.studio</span>
        </div>
      </div>
    </div>
  );
}
