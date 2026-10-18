"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tambahKeKeranjang } from "@/app/keranjang/actions";

export default function TambahKeranjang({
  productId,
  stok,
  ringkas = false,
}: {
  productId: number;
  stok?: number;
  ringkas?: boolean;
}) {
  const router = useRouter();
  const [pesan, setPesan] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  const ukuran = ringkas ? "px-2 text-xs sm:px-4 sm:text-sm" : "px-4 text-sm";

  async function klik() {
    setProses(true);
    setPesan(null);
    const hasil = await tambahKeKeranjang(productId);
    setProses(false);

    if (hasil.error) {
      if (hasil.error.startsWith("Masuk dulu")) router.push("/sign-in");
      else setPesan(hasil.error);
    } else {
      setPesan("Masuk ke keranjang");
    }
  }

  if (stok === 0) {
    return (
      <div className="mt-3">
        <button
          disabled
          className={`w-full rounded-full border-2 border-hijau py-2 font-semibold text-hijau opacity-40 ${ukuran}`}
        >
          Stok habis
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={klik}
        disabled={proses}
        className={`w-full rounded-full border-2 border-hijau py-2 font-semibold text-hijau disabled:opacity-50 ${ukuran}`}
      >
        {proses ? (
          "Memproses..."
        ) : ringkas ? (
          <>
            <span className="sm:hidden">+ Keranjang</span>
            <span className="hidden sm:inline">Tambah ke keranjang</span>
          </>
        ) : (
          "Tambah ke keranjang"
        )}
      </button>
      {pesan && <p className="mt-1.5 text-xs text-hijau">{pesan}</p>}
    </div>
  );
}
