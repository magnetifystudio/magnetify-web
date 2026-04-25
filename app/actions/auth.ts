"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  
  // Saari cookies ko fetch karke bulk delete
  const allCookies = cookieStore.getAll();
  
  if (allCookies && allCookies.length > 0) {
    allCookies.forEach((cookie) => {
      cookieStore.delete(cookie.name);
    });
  }

  // Redirect to login page
  redirect("/admin/login");
}