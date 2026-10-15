"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tambahKeKeranjang } from "@/app/keranjang/actions";

export default function TambahKeranjang({ productId }: { productId: number }) {
  const router = useRouter();
  const [pesan, setPesan] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

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

  return (
    <div className="mt-3">
      <button
        onClick={klik}
        disabled={proses}
        className="w-full rounded-full border-2 border-hijau px-4 py-2 text-sm font-semibold text-hijau disabled:opacity-50"
      >
        {proses ? "Memproses..." : "Tambah ke keranjang"}
      </button>
      {pesan && <p className="mt-1.5 text-xs text-hijau">{pesan}</p>}
    </div>
  );
}