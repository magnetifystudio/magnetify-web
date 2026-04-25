"use client";
import { useState, useEffect, useRef } from 'react';
import { createClient } from "@/utils/supabase/client"; 
import { Bell, CheckCheck, Package } from "lucide-react";

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const supabase = createClient(); 

  const fetchUnreadCount = async () => {
    const { count, error } = await supabase
      .from('customer_orders')
      .select('*', { count: 'exact', head: true })
      .eq('is_notified', false);
    
    if (!error) setUnreadCount(count || 0);
  };

  const fetchRecentNotifications = async () => {
    const { data, error } = await supabase
      .from('customer_orders')
      .select('id, created_at, customer_name, order_id')
      .eq('is_notified', false)
      .order('created_at', { ascending: false })
      .limit(8);
    
    if (!error && data) {
      setNotifications(data);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const channel = supabase
      .channel('order-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'customer_orders' }, 
        () => {
          setUnreadCount(prev => prev + 1);
          if (isDropdownOpen) fetchRecentNotifications(); 
        }
      )
      .subscribe();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleBellClick = async () => {
    const newDropdownState = !isDropdownOpen;
    setIsDropdownOpen(newDropdownState);

    if (newDropdownState && unreadCount > 0) {
      fetchRecentNotifications();
      const { error } = await supabase
        .from('customer_orders')
        .update({ is_notified: true })
        .eq('is_notified', false);

      if (!error) {
        setUnreadCount(0);
      }
    } else if (newDropdownState) {
        fetchRecentNotifications();
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('customer_orders')
      .update({ is_notified: true })
      .eq('is_notified', false);

    if (!error) {
      setUnreadCount(0);
      setNotifications([]);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} style={{ zIndex: 1000 }}>
      {/* Bell Icon */}
      <button 
        onClick={handleBellClick} 
        className="relative text-gray-400 hover:text-orange-400 transition-colors p-2.5 rounded-full hover:bg-white/5 focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white border-2 border-[#0A0A0A] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN - Returning to Absolute but with forced Z-Index stack */}
      {isDropdownOpen && (
        <div 
          className="absolute right-0 top-full mt-3 w-[350px] bg-white border border-[#adb5bd] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{ zIndex: 999999 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#f8f9fa]">
            <h3 className="font-bold text-[12px] uppercase tracking-wider text-gray-700">Recent Notifications</h3>
            <button 
              onClick={markAllAsRead}
              className="text-[#007185] text-[11px] font-bold flex items-center gap-1 hover:text-[#c45500] transition-colors"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors flex gap-3 last:border-b-0">
                  <div className="mt-1 text-orange-500 flex-shrink-0">
                    <Package size={16} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">
                      New Order: <span className="text-[#007185]">#{order.order_id}</span>
                    </p>
                    <p className="text-[12px] text-gray-500 mt-0.5 truncate">
                      Buyer: {order.customer_name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium italic uppercase">
                      {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-400 bg-white">
                <Bell size={24} className="mx-auto mb-2 opacity-10" />
                <p className="text-[12px] font-medium uppercase tracking-widest">No new orders</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;