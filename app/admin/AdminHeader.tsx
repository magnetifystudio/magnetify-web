"use client";
import React from "react";
import { LogOut, UserCircle } from "lucide-react";
import { logoutAction } from "../actions/auth"; 
import NotificationBell from "@/components/NotificationBell"; 

export default function AdminHeader() {
  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await logoutAction();
  };

  return (
    /* FIXED: z-index ko 100 kiya taaki dropdown niche ke elements se upar rahe */
    <header className="sticky top-0 z-[100] w-full bg-[#232f3e] border-b border-[#3a4553] shadow-md">
      <div className="flex h-20 items-center justify-between px-8">
        
        {/* Left Side: Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-[3px] bg-orange-400 rounded-full"></div>
          <div>
            <p className="text-[11px] font-bold text-orange-400 uppercase tracking-[0.2em] leading-none mb-1.5">
              Control Panel
            </p>
            <p className="text-sm text-gray-400 font-medium">
              Store Management & Analytics
            </p>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-6">
          
          {/* Notification Bell - Iska dropdown ab header ke high z-index ki wajah se upar dikhega */}
          <div className="relative">
             <NotificationBell />
          </div>

          {/* Divider Line */}
          <div className="h-8 w-[1px] bg-[#3a4553]"></div>

          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-[#eaeded]">Administrator</p>
              <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest leading-none mt-1">
                System Online
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#3a4553] border border-[#4a5568] flex items-center justify-center text-gray-300 shadow-inner">
               <UserCircle size={28} />
            </div>
          </div>
          
          {/* Sign Out Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3a4553] text-[#eaeded] rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold border border-[#4a5568] shadow-sm active:scale-95 text-xs"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}