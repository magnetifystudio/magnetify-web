import { NextResponse } from "next/server";
import { getSellerOrderEmail } from "@/lib/order-email-templates";
import {
  PAYMENT_PROOFS_BUCKET,
  formatRupees,
  generateOrderId,
  getOrderProofPath,
  parseCartPayload,
  parseCurrencyValue,
  validatePaymentProof,
} from "@/lib/order-utils";
import { createResendClient, getResendFromEmail } from "@/lib/resend";
import {
  type CustomerOrderInsert,
  createPublicSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

const sellerOrderEmail =
  process.env.ORDER_NOTIFICATION_EMAIL ?? "magnetifystudio@outlook.com";

export const runtime = "nodejs";

function asText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function redirectToCheckout(request: Request, errorMessage: string) {
  const failureUrl = new URL("/checkout", request.url);
  failureUrl.searchParams.set("error", errorMessage);
  return NextResponse.redirect(failureUrl, { status: 303 });
}

export async function POST(request: Request) {
  const submittedForm = await request.formData();
  const customerName = asText(submittedForm.get("customer_name")).trim();
  const customerEmail = asText(submittedForm.get("customer_email")).trim().toLowerCase();
  const mobileNumber = asText(submittedForm.get("customer_mobile")).trim();
  const shippingAddress = asText(submittedForm.get("shipping_address")).trim();
  const transactionId = asText(submittedForm.get("transaction_id")).trim();
  const proofFileEntry = submittedForm.get("attachment");
  const paymentProof = proofFileEntry instanceof File ? proofFileEntry : null;
  const cartItems = parseCartPayload(asText(submittedForm.get("cart_payload")));
  const parsedItemCount = parseCurrencyValue(asText(submittedForm.get("item_count")));
  const itemCount = parsedItemCount || cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = parseCurrencyValue(asText(submittedForm.get("subtotal_value")));
  const deliveryCharge = parseCurrencyValue(asText(submittedForm.get("delivery_charge_value")));
  const totalAmount =
    parseCurrencyValue(asText(submittedForm.get("total_amount_value"))) ||
    subtotal + deliveryCharge;

  // ── NEW: cart photos from localStorage (sent as hidden field) ──
  // Customer ke localStorage se photo data form mein pass karna hoga
  // (see checkout-form.tsx changes needed below)
  const cartPhotosRaw = asText(submittedForm.get("cart_photos_payload"));

  if (!customerName || !customerEmail || !mobileNumber || !shippingAddress || !transactionId) {
    return redirectToCheckout(request, "Please complete all customer, address, and transaction details before submitting.");
  }

  if (cartItems.length === 0) {
    return redirectToCheckout(request, "Your cart is empty. Please add at least one product before checkout.");
  }

  const validationError = validatePaymentProof(paymentProof);
  if (validationError) return redirectToCheckout(request, validationError);
  if (!paymentProof) return redirectToCheckout(request, "Please upload the payment screenshot.");

  const orderId = generateOrderId();
  const paymentProofPath = getOrderProofPath(orderId, paymentProof.name);
  const serviceSupabase = createServiceSupabaseClient();
  const publicSupabase = createPublicSupabaseClient();

  const orderRecord: CustomerOrderInsert = {
    order_id: orderId,
    customer_name: customerName,
    customer_email: customerEmail,
    mobile_number: mobileNumber,
    shipping_address: shippingAddress,
    cart_items: cartItems,
    item_count: itemCount,
    subtotal,
    delivery_charge: deliveryCharge,
    total_amount: totalAmount,
    transaction_id: transactionId,
    payment_proof_path: paymentProofPath,
    payment_proof_content_type: paymentProof.type,
    payment_status: "awaiting_verification",
    fulfillment_status: "pending",
    rejection_note: null,
  };

  try {
    // ── 1. Upload payment screenshot ──
    const { error: uploadError } = await serviceSupabase.storage
      .from(PAYMENT_PROOFS_BUCKET)
      .upload(paymentProofPath, paymentProof, {
        cacheControl: "3600",
        contentType: paymentProof.type,
        upsert: false,
      });

    if (uploadError) throw new Error("Could not upload payment proof.");

    // ── 2. Insert order ──
    const { data: insertedOrder, error: insertError } = await publicSupabase
      .from("customer_orders")
      .insert([orderRecord] as any)
      .select("id")
      .single();

    if (insertError) {
      await serviceSupabase.storage.from(PAYMENT_PROOFS_BUCKET).remove([paymentProofPath]);
      throw new Error("Could not save the order.");
    }

    const dbOrderId = (insertedOrder as any)?.id as string | undefined;

    // ── 3. Save photos to order_photos table ──
    // cart_photos_payload format:
    // { [cartItemId]: { product_id, photo_urls: string[], ... } }
    if (cartPhotosRaw && dbOrderId) {
      try {
        const cartPhotos = JSON.parse(cartPhotosRaw) as Record<string, {
          product_id: string;
          product_title: string;
          variant_label: string;
          price: number;
          photo_urls: string[];
        }>;

        const photoRows = [] as any[];

        for (const [cartItemId, photoData] of Object.entries(cartPhotos)) {
          if ((photoData.photo_urls || []).length > 0) {
            photoRows.push({
              order_id: dbOrderId,
              cart_item_id: cartItemId,
              product_id: photoData.product_id,
              product_title: photoData.product_title || "",
              variant_label: photoData.variant_label || "",
              price: photoData.price || 0,
              photo_urls: photoData.photo_urls,
            });
          }
        }

        if (photoRows.length > 0) {
          await publicSupabase.from("order_photos").insert(photoRows as any);
        }
      } catch (e) {
        console.error("Could not save order photos:", e);
      }
    }

    // ── 4. Send email ──
    try {
      const email = getSellerOrderEmail({
        orderId,
        customerName,
        customerEmail,
        mobileNumber,
        totalAmount,
        transactionId,
        shippingAddress,
        items: cartItems,
      });
      const fromEmail = getResendFromEmail();
      const resend = createResendClient();
      await resend.emails.send({
        from: fromEmail,
        to: sellerOrderEmail,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } catch (err) {
      console.log("EMAIL ERROR:", err);
    }

    const confirmationUrl = new URL("/order-confirmation", request.url);
    confirmationUrl.searchParams.set("customer", customerName);
    confirmationUrl.searchParams.set("orderId", orderId);
    confirmationUrl.searchParams.set("transactionId", transactionId);
    confirmationUrl.searchParams.set("amount", formatRupees(totalAmount));

    return NextResponse.redirect(confirmationUrl, { status: 303 });

  } catch (error: any) {
    console.error("SUBMIT ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}