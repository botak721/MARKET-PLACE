"use client";

import { useState } from "react";
import { kirimUlasan } from "@/app/pesanan/actions";

export default function FormUlasan({
  orderItemId,
  onSelesai,
}: {
  orderItemId: number;
  onSelesai: () => void | Promise<void>;
}) {
  const [buka, setBuka] = useState(false);
  const [bintang, setBintang] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);

  async function handleKirim() {
    setError(null);
    setMengirim(true);
    const hasil = await kirimUlasan(orderItemId, bintang, komentar);
    setMengirim(false);
    if (hasil.error) {
      setError(hasil.error);
    } else {
      await onSelesai();
    }
  }

  if (!buka) {
    return (
      <button
        onClick={() => setBuka(true)}
        className="mt-1 text-sm font-semibold text-hijau underline"
      >
        Beri ulasan
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-2xl border-2 border-hijau p-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setBintang(n)}
            aria-label={`${n} bintang`}
            className={`text-2xl ${n <= bintang ? "text-[#d99a1e]" : "opacity-30"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={komentar}
        onChange={(e) => setKomentar(e.target.value)}
        placeholder="Tulis pengalamanmu (boleh dikosongkan)"
        maxLength={500}
        rows={3}
        className="w-full rounded-2xl border-2 border-hijau bg-transparent px-4 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleKirim}
          disabled={mengirim}
          className="flex-1 rounded-full bg-hijau px-4 py-2 text-sm font-semibold text-krem"
        >
          {mengirim ? "Mengirim..." : "Kirim ulasan"}
        </button>
        <button
          onClick={() => setBuka(false)}
          className="rounded-full border-2 border-hijau px-4 py-2 text-sm font-semibold text-hijau"
        >
          Batal
        </button>
      </div>
    </div>
  );
}