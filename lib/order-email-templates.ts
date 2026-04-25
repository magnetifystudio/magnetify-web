import { formatRupees, summarizeCartItems, type OrderLineItem } from "@/lib/order-utils";

type SellerOrderEmailInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  mobileNumber: string;
  totalAmount: number;
  transactionId: string;
  shippingAddress: string;
  items: OrderLineItem[];
};

type CustomerPaymentEmailInput = {
  orderId: string;
  customerName: string;
};

export function getSellerOrderEmail(input: SellerOrderEmailInput) {
  const itemSummary = summarizeCartItems(input.items);

  return {
    subject: `New Magnetify order awaiting verification | ${input.orderId}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8f8fb;padding:24px;color:#1A1A1B">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #ece8e4">
          <p style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#FF1B6B;font-weight:700;margin:0 0 12px">Magnetify Studio Orders</p>
          <h1 style="font-size:30px;line-height:1.2;margin:0 0 12px">New payment proof submitted</h1>
          <p style="font-size:16px;line-height:1.7;color:#5f6470;margin:0 0 24px">A new order is waiting for verification in the admin dashboard.</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;font-weight:700">Order ID</td><td style="padding:10px 0">${input.orderId}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700">Customer</td><td style="padding:10px 0">${input.customerName}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700">Email</td><td style="padding:10px 0">${input.customerEmail}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700">Mobile</td><td style="padding:10px 0">${input.mobileNumber}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700">Transaction ID</td><td style="padding:10px 0">${input.transactionId}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700">Amount</td><td style="padding:10px 0">${formatRupees(input.totalAmount)}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700;vertical-align:top">Items</td><td style="padding:10px 0">${itemSummary}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700;vertical-align:top">Shipping</td><td style="padding:10px 0">${input.shippingAddress}</td></tr>
          </table>
          <p style="font-size:14px;line-height:1.7;color:#5f6470;margin:24px 0 0">Open <strong>/admin/orders</strong> to verify or reject this payment proof.</p>
        </div>
      </div>
    `,
    text: [
      "Magnetify Studio order awaiting verification",
      `Order ID: ${input.orderId}`,
      `Customer: ${input.customerName}`,
      `Email: ${input.customerEmail}`,
      `Mobile: ${input.mobileNumber}`,
      `Transaction ID: ${input.transactionId}`,
      `Amount: ${formatRupees(input.totalAmount)}`,
      `Items: ${itemSummary}`,
      `Shipping: ${input.shippingAddress}`,
    ].join("\n"),
  };
}

export function getPaymentVerifiedEmail(input: CustomerPaymentEmailInput) {
  return {
    subject: `Payment verified for order ${input.orderId}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8f8fb;padding:24px;color:#1A1A1B">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #ece8e4">
          <p style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#FF1B6B;font-weight:700;margin:0 0 12px">Magnetify Studio</p>
          <h1 style="font-size:30px;line-height:1.2;margin:0 0 12px">Your payment has been verified</h1>
          <p style="font-size:16px;line-height:1.8;color:#5f6470;margin:0 0 18px">Hi ${input.customerName}, your full payment for order <strong>${input.orderId}</strong> has been successfully verified.</p>
          <p style="font-size:16px;line-height:1.8;color:#5f6470;margin:0">Your custom magnets are now moving into production. We will share the next update once the order is prepared for dispatch.</p>
        </div>
      </div>
    `,
    text: `Hi ${input.customerName}, your full payment for order ${input.orderId} has been successfully verified. Your custom magnets are now moving into production!`,
  };
}

export function getPaymentRejectedEmail(input: CustomerPaymentEmailInput) {
  return {
    subject: `Payment proof needs attention for order ${input.orderId}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8f8fb;padding:24px;color:#1A1A1B">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #ece8e4">
          <p style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#FF1B6B;font-weight:700;margin:0 0 12px">Magnetify Studio</p>
          <h1 style="font-size:30px;line-height:1.2;margin:0 0 12px">Please re-upload your payment proof</h1>
          <p style="font-size:16px;line-height:1.8;color:#5f6470;margin:0 0 18px">Hi ${input.customerName}, we could not verify the payment proof shared for order <strong>${input.orderId}</strong>.</p>
          <p style="font-size:16px;line-height:1.8;color:#5f6470;margin:0">Please reply with the correct screenshot or transaction proof so we can continue with your order without delay.</p>
        </div>
      </div>
    `,
    text: `Hi ${input.customerName}, we could not verify the payment proof for order ${input.orderId}. Please re-upload the screenshot or transaction proof so we can continue with your order.`,
  };
}
