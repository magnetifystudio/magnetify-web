"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Star, CheckCircle2 } from "lucide-react";

type OrderProduct = {
  product_id: string;
  title_name: string;
  main_image: string;
};

type FeedbackPopupProps = {
  orderId: string;
  customerName: string;
};

export function FeedbackPopup({ orderId, customerName }: FeedbackPopupProps) {
  const supabase = createClient();

  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hovers, setHovers] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // 3 second delay before showing popup
  useEffect(() => {
    if (!orderId) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [orderId]);

  // Fetch products when popup becomes visible
  useEffect(() => {
    if (!orderId || !visible) return;
    fetchOrderProducts();
  }, [orderId, visible]);

  const fetchOrderProducts = async () => {
    // 1. Pehle check karo — kya already review diya hai
    const { data: existingReviews } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("order_id", orderId)
      .limit(1);

    if (existingReviews && existingReviews.length > 0) {
      setAlreadyReviewed(true);
      return;
    }

    // 2. Order fetch karo customer_orders table se
    const { data: orderData, error: orderError } = await supabase
      .from("customer_orders")
      .select("cart_items")
      .eq("order_id", orderId)
      .single();

    if (orderError || !orderData?.cart_items) return;

    const cartItems = orderData.cart_items as any[];

    // 3. href se slug extract karo: "/products/product-slug-here" -> "product-slug-here"
    const slugs = [
      ...new Set(
        cartItems
          .map((item: any) => {
            const href = item.href as string;
            if (!href) return null;
            const parts = href.split("/products/");
            return parts[1] || null;
          })
          .filter(Boolean)
      ),
    ];

    if (slugs.length === 0) return;

    // 4. In slugs se products ki details fetch karo
    const { data: productsData, error: productsError } = await supabase
      .from("magnetify_products")
      .select("id, title_name, main_image")
      .in("slug", slugs);

    if (productsError) {
      console.error("Error fetching products by slug:", productsError);
      return;
    }

    if (productsData) {
      setProducts(
        productsData.map((p: any) => ({
          product_id: p.id,
          title_name: p.title_name,
          main_image: p.main_image,
        }))
      );
    }
  };

  const handleSubmit = async () => {
    const hasAtLeastOne = Object.values(ratings).some((r) => r > 0);
    if (!hasAtLeastOne) return;

    setLoading(true);
    try {
      const reviews = products
        .filter((p) => ratings[p.product_id] > 0)
        .map((p) => ({
          order_id: orderId,
          product_id: p.product_id,
          customer_name: customerName,
          rating: ratings[p.product_id],
          feedback_text: feedbacks[p.product_id] || null,
          is_verified_purchase: true,
        }));

      const { error } = await supabase.from("product_reviews").insert(reviews);
      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || alreadyReviewed) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] transition-opacity"
        onClick={() => setVisible(false)}
      />

      {/* Main Popup */}
      <div className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[999] w-full sm:max-w-lg sm:rounded-[2rem] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.2)] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink">
              Quick Feedback
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              How was your experience?
            </h2>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {submitted ? (
            <div className="py-8 flex flex-col items-center text-center gap-4">
              <CheckCircle2 size={48} className="text-green-500" />
              <h3 className="text-xl font-semibold text-foreground">
                Thank you, {customerName}!
              </h3>
              <p className="text-muted text-sm leading-7">
                Your feedback helps us improve and helps other customers make
                better decisions. We really appreciate it! 🙏
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-muted text-sm">
              Loading order items...
            </div>
          ) : (
            <div className="space-y-6">
              {products.map((product, index) => (
                <div key={product.product_id} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.main_image ? (
                        <img
                          src={product.main_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                          IMG
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-2">
                      {product.title_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() =>
                          setHovers((h) => ({ ...h, [product.product_id]: star }))
                        }
                        onMouseLeave={() =>
                          setHovers((h) => ({ ...h, [product.product_id]: 0 }))
                        }
                        onClick={() =>
                          setRatings((r) => ({ ...r, [product.product_id]: star }))
                        }
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          className="transition-colors"
                          fill={
                            star <=
                            (hovers[product.product_id] ||
                              ratings[product.product_id] ||
                              0)
                              ? "#FF385C"
                              : "none"
                          }
                          stroke={
                            star <=
                            (hovers[product.product_id] ||
                              ratings[product.product_id] ||
                              0)
                              ? "#FF385C"
                              : "#d1d5db"
                          }
                        />
                      </button>
                    ))}
                    {ratings[product.product_id] > 0 && (
                      <span className="ml-2 text-sm font-semibold text-pink">
                        {
                          ["", "Poor", "Fair", "Good", "Great", "Excellent!"][
                            ratings[product.product_id]
                          ]
                        }
                      </span>
                    )}
                  </div>

                  {ratings[product.product_id] > 0 && (
                    <textarea
                      value={feedbacks[product.product_id] || ""}
                      onChange={(e) =>
                        setFeedbacks((f) => ({
                          ...f,
                          [product.product_id]: e.target.value,
                        }))
                      }
                      placeholder="Tell us more... (optional)"
                      rows={2}
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-pink/50 resize-none transition-colors"
                    />
                  )}

                  {index < products.length - 1 && (
                    <div className="border-t border-border mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!submitted && (
          <div className="px-6 pb-6 pt-4 border-t border-border flex items-center justify-between gap-3">
            <button
              onClick={() => setVisible(false)}
              className="text-sm text-muted hover:text-foreground transition-colors font-medium"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || Object.values(ratings).every((r) => r === 0)}
              className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        )}

        {submitted && (
          <div className="px-6 pb-6 pt-2 flex justify-center">
            <button
              onClick={() => setVisible(false)}
              className="inline-flex rounded-full bg-pink px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}