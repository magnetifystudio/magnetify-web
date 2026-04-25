import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminSessionCookieName,
  getAdminSessionCookieOptions,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email =
    typeof formData.get("email") === "string" ? String(formData.get("email")) : "";
  const password =
    typeof formData.get("password") === "string"
      ? String(formData.get("password"))
      : "";

  // Authentication check
  if (!(email === "magnetifystudio@outlook.com" && password === "Magnetify!2#")) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), {
      status: 303,
    });
  }

  const token = await createAdminSessionToken(email);

  // FIX: Pehle yahan "/admin/orders" tha, ab seedha dashboard bhejega
  const response = NextResponse.redirect(new URL("/admin", request.url), {
    status: 303,
  });

  response.cookies.set(
    getAdminSessionCookieName(),
    token,
    getAdminSessionCookieOptions(),
  );

  return response;
}