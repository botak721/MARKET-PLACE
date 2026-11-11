"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, Store } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ambilKeranjang } from "@/app/keranjang/actions";
import { EVENT_KERANJANG } from "@/lib/keranjang-event";

const ikon =
  "relative flex h-11 w-11 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:w-auto md:gap-2 md:px-3";

export default function AuthNav() {
  const { data: session, isPending } = useSession();
  const [jumlah, setJumlah] = useState(0);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setJumlah(0);
      return;
    }
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
  }, [userId]);

  if (isPending) return <div className="h-11 w-24" aria-hidden="true" />;

  if (!session?.user) {
    return (
      <nav aria-label="Akun" className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/sign-in"
          className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          Masuk
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex min-h-11 items-center rounded-full bg-biru px-5 text-sm font-semibold text-white transition-colors hover:bg-biru-tua"
        >
          Daftar
        </Link>
      </nav>
    );
  }

  return (
    <nav aria-label="Akun" className="flex items-center gap-0.5 sm:gap-1">
      <Link
        href="/keranjang"
        aria-label={jumlah > 0 ? `Keranjang, ${jumlah} barang` : "Keranjang"}
        className={ikon}
      >
        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
        <span className="hidden text-sm font-semibold md:inline">Keranjang</span>
        {jumlah > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-biru px-1 text-[11px] font-bold text-white md:top-0.5 md:right-0.5"
          >
            {jumlah > 99 ? "99+" : jumlah}
          </span>
        )}
      </Link>
      <Link href="/pesanan" aria-label="Pesanan" className={ikon}>
        <Package className="h-5 w-5" aria-hidden="true" />
        <span className="hidden text-sm font-semibold md:inline">Pesanan</span>
      </Link>
      <Link
        href="/dashboard"
        aria-label="Dashboard toko"
        className={`${ikon} bg-white/10 !text-white`}
      >
        <Store className="h-5 w-5" aria-hidden="true" />
        <span className="hidden text-sm font-semibold md:inline">Dashboard</span>
      </Link>
    </nav>
  );
}
