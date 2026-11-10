"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import { tambahKeKeranjang } from "@/app/keranjang/actions";

export default function TombolKeranjang({
  productId,
  nama,
  stok,
}: {
  productId: number;
  nama: string;
  stok?: number;
}) {
  const router = useRouter();
  const [proses, setProses] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function klik() {
    setProses(true);
    setPesan(null);
    const hasil = await tambahKeKeranjang(productId);
    setProses(false);

    if (hasil.error) {
      if (hasil.error.startsWith("Masuk dulu")) router.push("/sign-in");
      else setPesan(hasil.error);
      return;
    }
    setBerhasil(true);
    timer.current = setTimeout(() => setBerhasil(false), 2000);
  }

  const habis = stok === 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={klik}
        disabled={proses || habis}
        aria-label={habis ? `${nama}, stok habis` : `Tambah ${nama} ke keranjang`}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-biru text-white shadow-md transition-all hover:bg-biru-tua active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none motion-reduce:transition-none"
      >
        {berhasil ? (
          <Check className="h-5 w-5" aria-hidden="true" />
        ) : (
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
      <p
        role="status"
        className={
          pesan
            ? "absolute right-0 bottom-12 z-10 w-44 rounded-lg bg-white p-2 text-xs text-red-600 shadow-kartu-naik"
            : "sr-only"
        }
      >
        {pesan ?? (berhasil ? "Masuk ke keranjang" : "")}
      </p>
    </div>
  );
}
