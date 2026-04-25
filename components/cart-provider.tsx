"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartItem = {
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

type CartItemInput = Omit<CartItem, "quantity">;

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (item: CartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "magnetify-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function formatRupees(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

const AVAILABLE_COUPONS = [
  { code: "WELCOME10", description: "Get 10% off on your first order" },
  { code: "MAGNETIFY20", description: "Flat Rs. 200 off on orders above 1999" },
];

function CartDrawer({
  isOpen,
  items,
  subtotal,
  onClose,
  onRemove,
  onUpdateQuantity,
}: {
  isOpen: boolean;
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}) {
  const router = useRouter();
  const freeDeliveryThreshold = 999;
  const amountLeft = Math.max(freeDeliveryThreshold - subtotal, 0);
  const progress = Math.min(subtotal / freeDeliveryThreshold, 1);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-charcoal/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[28rem] flex-col border-l border-black/8 bg-white shadow-[-20px_0_60px_rgba(26,26,27,0.18)] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">
              Cart
            </p>
            <p className="mt-2 text-sm text-muted">
              {items.length === 0
                ? "Your custom picks will appear here."
                : `${items.reduce((sum, item) => sum + item.quantity, 0)} item(s) ready`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-white text-charcoal hover:border-pink/40 hover:text-pink"
            aria-label="Close cart"
          >
            <span className="text-2xl leading-none">x</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-[#fff3f8] px-5 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-pink">
              Your cart is empty
            </div>
            <h3 className="mt-5 text-3xl tracking-[-0.04em] text-foreground">
              Start with one memory-led product.
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-muted">
              Add a product from any listing page and this slide-in cart will keep
              your picks ready while you continue browsing.
            </p>
            <Link
              href="/#shop-all"
              onClick={onClose}
              className="mt-6 inline-flex rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(255,27,107,0.26)] hover:-translate-y-0.5 hover:bg-orange"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[1.75rem] border border-border bg-white p-4 shadow-[0_14px_35px_rgba(26,26,27,0.04)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.35rem] bg-[#f6efe6]">
                        <Image
                          src={item.imageSrc}
                          alt={item.imageAlt}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="text-lg font-semibold leading-7 tracking-[-0.03em] text-foreground hover:text-pink"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <h3 className="text-lg font-semibold leading-7 tracking-[-0.03em] text-foreground">
                            {item.title}
                          </h3>
                        )}

                        {item.variantLabel ? (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                            {item.variantLabel}
                          </p>
                        ) : null}

                        <p className="mt-3 text-sm font-medium text-muted">
                          {item.quantity} x {item.priceLabel}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="flex size-9 items-center justify-center rounded-full border border-border text-sm text-charcoal hover:border-pink/40 hover:text-pink"
                        aria-label={`Remove ${item.title}`}
                      >
                        x
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-border bg-[#fbfbfc] p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="flex size-8 items-center justify-center rounded-full text-lg text-charcoal hover:bg-white"
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          -
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="flex size-8 items-center justify-center rounded-full text-lg text-charcoal hover:bg-white"
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          +
                        </button>
                      </div>

                      <p className="text-base font-semibold text-foreground">
                        {formatRupees(item.price * item.quantity)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Coupons Section */}
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Available Coupons</p>
                <div className="mt-4 space-y-3">
                  {AVAILABLE_COUPONS.map((coupon) => (
                    <div key={coupon.code} className="flex items-center justify-between rounded-2xl border border-dashed border-pink/30 bg-pink/5 p-4">
                      <div>
                        <p className="font-bold text-pink">{coupon.code}</p>
                        <p className="text-xs text-muted-foreground">{coupon.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem("magnetify-applied-coupon", coupon.code);
                          router.push("/checkout");
                          onClose();
                        }}
                        className="rounded-full bg-pink px-4 py-1.5 text-xs font-bold text-white hover:bg-pink/90"
                      >
                        APPLY
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-white px-6 py-5">
              <div className="rounded-[1.6rem] border border-[#eadfd5] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f2ea_100%)] p-5">
                <div className="flex items-center justify-between text-base text-foreground">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">{formatRupees(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted">
                  <span>Estimated total</span>
                  <span>{formatRupees(subtotal)}</span>
                </div>

                <div className="mt-5 rounded-[1.4rem] bg-white p-4 shadow-[0_12px_24px_rgba(26,26,27,0.05)]">
                  <p className="text-sm font-semibold text-foreground">
                    {amountLeft > 0
                      ? `Add ${formatRupees(amountLeft)} more to unlock free delivery`
                      : "Free delivery unlocked for this cart"}
                  </p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f2e8dc]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#ff1b6b_0%,#ff8c37_100%)] transition-[width] duration-300"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full border border-charcoal bg-charcoal px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:-translate-y-0.5"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full bg-[#fede00] px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-charcoal shadow-[0_18px_35_rgba(254,222,0,0.26)] hover:-translate-y-0.5 hover:bg-[#ffd700]"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);
      setItems(storedItems ? (JSON.parse(storedItems) as CartItem[]) : []);
    } catch {
      setItems([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hasHydrated]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      isOpen,
      addItem: (item) => {
        setItems((currentItems) => {
          const existingItem = currentItems.find((currentItem) => currentItem.id === item.id);
          if (existingItem) {
            return currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? { ...currentItem, quantity: currentItem.quantity + 1 }
                : currentItem,
            );
          }
          return [...currentItems, { ...item, quantity: 1 }];
        });
        setIsOpen(true);
      },
      removeItem: (id) => {
        setItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== id));
      },
      updateQuantity: (id, quantity) => {
        setItems((currentItems) => {
          if (quantity <= 0) {
            return currentItems.filter((currentItem) => currentItem.id !== id);
          }
          return currentItems.map((currentItem) =>
            currentItem.id === id ? { ...currentItem, quantity } : currentItem,
          );
        });
      },
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      // FIX: localStorage bhi clear karo warna hydration effect dobara items restore kar deta hai
      clearCart: () => {
        setItems([]);
        setIsOpen(false);
        try {
          window.localStorage.removeItem(CART_STORAGE_KEY);
        } catch {
          // ignore storage errors
        }
      },
    };
  }, [items, isOpen]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer
        isOpen={isOpen}
        items={items}
        subtotal={value.subtotal}
        onClose={value.closeCart}
        onRemove={value.removeItem}
        onUpdateQuantity={value.updateQuantity}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
