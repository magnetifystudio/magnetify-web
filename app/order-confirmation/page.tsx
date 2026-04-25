import { OrderConfirmationContent } from "@/components/order-confirmation-content";

type OrderConfirmationPageProps = {
  searchParams: Promise<{
    customer?: string;
    orderId?: string;
    transactionId?: string;
    amount?: string;
  }>;
};

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const { customer, orderId, transactionId, amount } = await searchParams;

  return (
    <OrderConfirmationContent
      customer={customer ?? ""}
      orderId={orderId ?? ""}
      transactionId={transactionId ?? ""}
      amount={amount ?? ""}
    />
  );
}
