export const PAYMENT_PROOFS_BUCKET = "payment-proofs";

export type OrderLineItem = {
  id: string;
  title: string;
  variantLabel?: string;
  price: number;
  priceLabel: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  quantity: number;
};

const allowedProofTypes = new Set(["image/jpeg", "image/png"]);
const allowedProofExtensions = new Set(["jpg", "jpeg", "png"]);

export function generateOrderId(now = new Date()) {
  const year = now.getFullYear().toString().slice(-2);
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  const random = `${Math.floor(1000 + Math.random() * 9000)}`;

  return `MAG${year}${month}${day}${random}`;
}

export function parseCurrencyValue(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatRupees(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export function parseCartPayload(value: string | null | undefined) {
  if (!value) {
    return [] as OrderLineItem[];
  }

  try {
    const parsed = JSON.parse(value) as OrderLineItem[];
    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.price === "number" &&
            typeof item.quantity === "number",
        )
      : [];
  } catch {
    return [];
  }
}

export function summarizeCartItems(items: OrderLineItem[]) {
  return items
    .map((item) => {
      const variant = item.variantLabel ? ` (${item.variantLabel})` : "";
      return `${item.title}${variant} x${item.quantity}`;
    })
    .join(", ");
}

export function validatePaymentProof(file: File | null) {
  if (!file || file.size === 0) {
    return "Please upload the payment screenshot.";
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedProofExtensions.has(extension) || !allowedProofTypes.has(file.type)) {
    return "Only JPG, JPEG, and PNG screenshots are allowed.";
  }

  if (file.size > 2 * 1024 * 1024) {
    return "Payment screenshot must be 2MB or smaller.";
  }

  return null;
}

export function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getOrderProofPath(orderId: string, fileName: string) {
  const safeName = sanitizeFileName(fileName) || "payment-proof.png";
  return `customer-orders/${orderId}/${Date.now()}-${safeName}`;
}
