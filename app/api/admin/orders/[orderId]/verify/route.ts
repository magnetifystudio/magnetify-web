import { NextResponse } from "next/server";
import {
  getPaymentVerifiedEmail,
} from "@/lib/order-email-templates";
import {
  getAdminSessionCookieName,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import { createResendClient, getResendFromEmail } from "@/lib/resend";
import {
  createServiceSupabaseClient,
  type CustomerOrderRow,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

type VerifyRouteProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function POST(request: Request, { params }: VerifyRouteProps) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${getAdminSessionCookieName()}=`))
    ?.split("=")[1];

  const session = await verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;
  const supabase = createServiceSupabaseClient();
  const { data: order, error: fetchError } = await supabase
    .from("customer_orders")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  const typedOrder = order as CustomerOrderRow;

  const nextState: Partial<CustomerOrderRow> = {
    payment_status: "paid",
    fulfillment_status: "in_production",
    rejection_note: null,
  };

  const { error: updateError } = await supabase
    .from("customer_orders")
    .update(nextState as never)
    .eq("order_id", orderId);

  if (updateError) {
    return NextResponse.json(
      { message: "Could not verify payment." },
      { status: 500 },
    );
  }

  try {
    const email = getPaymentVerifiedEmail({
      orderId: typedOrder.order_id,
      customerName: typedOrder.customer_name,
    });
    const resend = createResendClient();
    await resend.emails.send({
      from: getResendFromEmail(),
      to: typedOrder.customer_email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch {
    // Keep the verified state intact even if email delivery fails.
  }

  return NextResponse.json({
    message: `Order ${orderId} verified and moved into production.`,
  });
}
