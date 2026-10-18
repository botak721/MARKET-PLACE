"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { editProduk } from "@/app/dashboard/actions";
import { KATEGORI } from "@/lib/kategori";

type Produk = {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  gambar: string | null;
  deskripsi: string | null;
  kategori: string | null;
};

const kolom =
  "w-full rounded-full border-2 border-hijau bg-transparent px-5 py-3";

export default function FormEditProduk({
  produk,
  onSelesai,
  onBatal,
}: {
  produk: Produk;
  onSelesai: () => void | Promise<void>;
  onBatal: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setProses(true);
    const data = new FormData(e.currentTarget);
    try {
      const file = data.get("gambar");
      if (file instanceof File && file.size > 0) {
        const blob = await upload(`produk/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        data.set("gambar", blob.url);
      } else {
        data.delete("gambar");
      }
      const hasil = await editProduk(produk.id, data);
      if (hasil.error) setError(hasil.error);
      else await onSelesai();
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setProses(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl bg-kartu p-4"
    >
      <p className="font-semibold">Edit produk</p>
      {error && <p className="text-red-600">{error}</p>}
      <input
        name="nama"
        defaultValue={produk.nama}
        required
        className={kolom}
      />
      <input
        name="harga"
        type="number"
        defaultValue={produk.harga}
        required
        min={100}
        className={kolom}
      />
      <input
        name="stok"
        type="number"
        defaultValue={produk.stok}
        required
        min={0}
        className={kolom}
      />
      <textarea
        name="deskripsi"
        defaultValue={produk.deskripsi ?? ""}
        placeholder="Deskripsi produk (boleh dikosongkan)"
        maxLength={1000}
        rows={4}
        className="w-full rounded-3xl border-2 border-hijau bg-transparent px-5 py-3"
      />
      <select
        name="kategori"
        defaultValue={produk.kategori ?? ""}
        className={kolom}
      >
        <option value="">Tanpa kategori</option>
        {KATEGORI.map((k) => (
          <option key={k.slug} value={k.slug}>
            {k.nama}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-3">
        {produk.gambar && (
          <img
            src={produk.gambar}
            alt={produk.nama}
            className="h-12 w-12 rounded-xl object-cover"
          />
        )}
        <div className="text-sm">
          <p className="opacity-70">
            Pilih file hanya kalau mau mengganti foto.
          </p>
          <input
            name="gambar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={proses}
          className="flex-1 rounded-full bg-hijau px-5 py-3 font-semibold text-krem disabled:opacity-50"
        >
          {proses ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onBatal}
          className="rounded-full border-2 border-hijau px-5 py-3 font-semibold text-hijau"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
