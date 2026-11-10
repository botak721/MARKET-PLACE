"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { tambahKeKeranjang } from "@/app/keranjang/actions";

const langkah =
  "flex h-11 w-11 items-center justify-center rounded-full text-tinta transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent";

export default function PembelianProduk({
  productId,
  harga,
  stok,
}: {
  productId: number;
  harga: number;
  stok: number;
}) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState(1);
  const [proses, setProses] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const maks = Math.min(stok, 99);

  async function tambah() {
    setProses(true);
    setPesan(null);
    setBerhasil(false);
    const hasil = await tambahKeKeranjang(productId, jumlah);
    setProses(false);

    if (hasil.error) {
      if (hasil.error.startsWith("Masuk dulu")) router.push("/sign-in");
      else setPesan(hasil.error);
      return;
    }
    setBerhasil(true);
  }

  if (stok <= 0) {
    return (
      <button
        type="button"
        disabled
        className="flex h-12 w-full items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600"
      >
        Stok habis
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            role="group"
            aria-label="Jumlah"
            className="flex items-center rounded-full border border-slate-300 bg-white"
          >
            <button
              type="button"
              onClick={() => setJumlah((j) => Math.max(1, j - 1))}
              disabled={jumlah <= 1}
              aria-label="Kurangi jumlah"
              className={langkah}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="w-10 text-center font-semibold tabular-nums"
            >
              {jumlah}
            </span>
            <button
              type="button"
              onClick={() => setJumlah((j) => Math.min(maks, j + 1))}
              disabled={jumlah >= maks}
              aria-label="Tambah jumlah"
              className={langkah}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {stok <= 5 && (
            <p className="text-sm font-semibold text-red-600">
              Tersisa {stok} lagi
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600">Subtotal</p>
          <p className="font-judul text-xl font-bold tabular-nums">
            Rp{(harga * jumlah).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={tambah}
        disabled={proses}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-biru font-semibold text-white shadow-lg shadow-biru/25 transition-all hover:bg-biru-tua active:scale-[0.99] disabled:opacity-60 motion-reduce:transition-none"
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        {proses ? "Memproses..." : "Tambah ke keranjang"}
      </button>

      <p
        role="status"
        className={
          pesan
            ? "text-sm text-red-600"
            : berhasil
              ? "text-sm text-slate-700"
              : "sr-only"
        }
      >
        {pesan ??
          (berhasil ? (
            <>
              Masuk ke keranjang.{" "}
              <Link href="/keranjang" className="font-semibold text-biru underline">
                Lihat keranjang
              </Link>
            </>
          ) : (
            ""
          ))}
      </p>
    </div>
  );
}
