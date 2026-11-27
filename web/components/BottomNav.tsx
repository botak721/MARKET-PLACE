"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Package, Store } from "lucide-react";
import { ambilKeranjang } from "@/app/keranjang/actions";
import { EVENT_KERANJANG } from "@/lib/keranjang-event";

const tabs = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/keranjang", label: "Keranjang", icon: ShoppingCart, badge: true },
  { href: "/pesanan", label: "Pesanan", icon: Package },
  { href: "/dashboard", label: "Dashboard", icon: Store },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [jumlah, setJumlah] = useState(0);

  useEffect(() => {
    let batal = false;
    const muat = () =>
      ambilKeranjang().then((item) => {
        if (!batal) setJumlah(item.length);
      });
    muat();
    window.addEventListener(EVENT_KERANJANG, muat);
    return () => {
      batal = true;
      window.removeEventListener(EVENT_KERANJANG, muat);
    };
  }, []);

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden h-16 pb-[env(safe-area-inset-bottom)]"
      style={{ backgroundColor: "#0b1120" }}
    >
      <div className="flex h-full items-stretch">
        {tabs.map(({ href, label, icon: Icon, badge }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`
                relative flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium
                transition-colors duration-150
                ${isActive ? "text-white" : "text-slate-400 hover:text-slate-200"}
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full"
                  style={{ backgroundColor: "#2563eb" }}
                  aria-hidden="true"
                />
              )}

              {/* Icon with optional badge */}
              <span className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {badge && jumlah > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                    style={{ backgroundColor: "#2563eb" }}
                  >
                    {jumlah > 99 ? "99+" : jumlah}
                  </span>
                )}
              </span>

              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
