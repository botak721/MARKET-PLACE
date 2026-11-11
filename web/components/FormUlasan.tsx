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
        type="button"
        onClick={() => setBuka(true)}
        className="inline-flex min-h-11 items-center rounded-full bg-blue-50 px-4 text-sm font-semibold text-biru-tua transition-colors hover:bg-blue-100"
      >
        Beri ulasan
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <fieldset>
        <legend className="mb-1 text-sm font-bold">Penilaianmu</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setBintang(n)}
              aria-label={`${n} bintang`}
              aria-pressed={n <= bintang}
              className={`flex h-11 w-11 items-center justify-center text-3xl ${n <= bintang ? "text-biru" : "text-slate-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor={`ulasan-${orderItemId}`} className="mb-1 block text-sm font-bold">
          Komentar (boleh dikosongkan)
        </label>
        <textarea
          id={`ulasan-${orderItemId}`}
          value={komentar}
          onChange={(e) => setKomentar(e.target.value)}
          placeholder="Ceritakan kualitas, kemasan, dan pengirimannya"
          maxLength={500}
          rows={3}
          className="w-full rounded-2xl border-[1.5px] border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-biru focus:ring-4 focus:ring-biru/15"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleKirim}
          disabled={mengirim}
          className="min-h-11 flex-1 rounded-full bg-biru px-4 text-sm font-semibold text-white transition-colors hover:bg-biru-tua disabled:opacity-60"
        >
          {mengirim ? "Mengirim..." : "Kirim ulasan"}
        </button>
        <button
          type="button"
          onClick={() => setBuka(false)}
          className="min-h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
