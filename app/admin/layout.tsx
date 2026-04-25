"use client";
import React, { useEffect, useRef, useCallback } from "react";
import AdminHeader from "./AdminHeader";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid, Package, PieChart, Megaphone,
  Image as ImageIcon, Sparkles, Tag, Ticket,
  Star, Users
} from "lucide-react";

// 30 minutes idle timeout
const IDLE_TIMEOUT_MS = 1000 * 60 * 30;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (path: string) => pathname === path;

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore fetch errors
    }
    router.push("/admin/login");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      logout();
    }, IDLE_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    // Yeh events pe timer reset hoga
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    // Start timer on mount
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetTimer]);

  return (
    <div className="flex min-h-screen bg-[#f4f7f9]">
      {/* Sidebar - Fixed Left */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#232f3e] text-[#eaeded] flex flex-col z-50 border-r border-[#3a4553]">
        <div className="p-6 text-2xl font-bold border-b border-[#3a4553] text-orange-400 tracking-tight">
          Magnetify Admin
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar font-sans text-sm">

          {/* Section: INVENTORY & SALES */}
          <div className="text-gray-500 text-[11px] uppercase font-bold px-3 mb-2 tracking-widest mt-4">
            Inventory & Sales
          </div>

          <Link href="/admin" className={`flex items-center p-3 rounded-md transition group ${isActive('/admin') ? 'bg-[#3a4553] text-white' : 'hover:bg-[#3a4553]'}`}>
            <PieChart size={18} className={`mr-3 ${isActive('/admin') ? 'text-orange-400' : 'text-gray-400'}`} /> Dashboard
          </Link>

          <Link href="/admin/inventory/catalog" className={`flex items-center p-3 rounded-md transition group ${pathname.startsWith('/admin/inventory') ? 'bg-[#3a4553] text-white' : 'hover:bg-[#3a4553]'}`}>
            <LayoutGrid size={18} className={`mr-3 ${pathname.startsWith('/admin/inventory') ? 'text-orange-400' : 'text-gray-400'}`} /> Category Inventory
          </Link>

          <Link href="/admin/orders" className={`flex items-center p-3 rounded-md transition group ${isActive('/admin/orders') ? 'bg-[#3a4553] text-white' : 'hover:bg-[#3a4553]'}`}>
            <Package size={18} className={`mr-3 ${isActive('/admin/orders') ? 'text-orange-400' : 'text-gray-400'}`} /> Manage Orders
          </Link>

          {/* Section: MARKETING & GROWTH */}
          <div className="text-gray-500 text-[11px] uppercase font-bold px-3 mb-2 mt-8 tracking-widest">
            Marketing & Growth
          </div>
          <Link href="/admin/announcement" className="flex items-center p-3 rounded-md hover:bg-[#3a4553] transition group text-gray-300">
            <Megaphone size={18} className="mr-3 text-gray-400" /> Announcement Bar
          </Link>
          <Link href="/admin/banners" className="flex items-center p-3 rounded-md hover:bg-[#3a4553] transition group text-gray-300">
            <ImageIcon size={18} className="mr-3 text-gray-400" /> Main Banners
          </Link>
          <Link href="/admin/popups" className="flex items-center p-3 rounded-md hover:bg-[#3a4553] transition group text-gray-300">
            <Sparkles size={18} className="mr-3 text-gray-400" /> Homepage Popups
          </Link>

          <Link href="/admin/leads" className={`flex items-center p-3 rounded-md transition group ${isActive('/admin/leads') ? 'bg-[#3a4553] text-white' : 'hover:bg-[#3a4553] text-gray-300'}`}>
            <Users size={18} className={`mr-3 ${isActive('/admin/leads') ? 'text-orange-400' : 'text-gray-400'}`} /> Popup Leads
          </Link>

          <Link href="/admin/offers" className="flex items-center p-3 rounded-md hover:bg-[#3a4553] transition group text-gray-300">
            <Tag size={18} className="mr-3 text-gray-400" /> Special Offers
          </Link>
          <Link href="/admin/coupons" className="flex items-center p-3 rounded-md hover:bg-[#3a4553] transition group text-gray-300">
            <Ticket size={18} className="mr-3 text-gray-400" /> Coupons
          </Link>

          {/* Section: STOREFRONT */}
          <div className="text-gray-500 text-[11px] uppercase font-bold px-3 mb-2 mt-8 tracking-widest">
            Storefront
          </div>
          <Link href="/admin/featured" className="flex items-center p-3 rounded-md hover:bg-[#3a4553] transition group text-gray-300">
            <Star size={18} className="mr-3 text-gray-400" /> Featured Items
          </Link>

        </nav>

        {/* Branding Footer */}
        <div className="p-4 border-t border-[#3a4553] bg-[#131a22] flex flex-col items-center">
          <p className="text-[10px] text-gray-500 text-center font-medium uppercase tracking-[0.3em]">
            Console v1.0
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
