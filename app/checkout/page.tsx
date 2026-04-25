import { CheckoutForm } from "@/components/checkout-form";

type CheckoutPageProps = {
  searchParams: Promise<{
    error?: string;
    status?: string;
  }>;
};

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { error, status } = await searchParams;

  const errorMessage =
    error ??
    (status === "error"
      ? "We could not submit your payment confirmation just now. Please try again in a moment."
      : undefined);

  return <CheckoutForm errorMessage={errorMessage} />;
}
