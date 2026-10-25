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
const label = "mb-1 block text-sm font-semibold";

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
  const id = (n: string) => `edit-${n}-${produk.id}`;

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
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <div>
        <label htmlFor={id("nama")} className={label}>
          Nama produk
        </label>
        <input
          id={id("nama")}
          name="nama"
          defaultValue={produk.nama}
          required
          className={kolom}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={id("harga")} className={label}>
            Harga (rupiah)
          </label>
          <input
            id={id("harga")}
            name="harga"
            type="number"
            inputMode="numeric"
            defaultValue={produk.harga}
            required
            min={100}
            className={kolom}
          />
        </div>
        <div>
          <label htmlFor={id("stok")} className={label}>
            Stok
          </label>
          <input
            id={id("stok")}
            name="stok"
            type="number"
            inputMode="numeric"
            defaultValue={produk.stok}
            required
            min={0}
            className={kolom}
          />
        </div>
      </div>
      <div>
        <label htmlFor={id("deskripsi")} className={label}>
          Deskripsi
        </label>
        <textarea
          id={id("deskripsi")}
          name="deskripsi"
          defaultValue={produk.deskripsi ?? ""}
          maxLength={1000}
          rows={4}
          className="w-full rounded-3xl border-2 border-hijau bg-transparent px-5 py-3"
        />
      </div>
      <div>
        <label htmlFor={id("kategori")} className={label}>
          Kategori
        </label>
        <select
          id={id("kategori")}
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
      </div>
      <div>
        <label htmlFor={id("gambar")} className={label}>
          Ganti foto (kosongkan kalau tidak diganti)
        </label>
        <div className="flex items-center gap-3">
          {produk.gambar && (
            <img
              src={produk.gambar}
              alt={`Foto saat ini: ${produk.nama}`}
              className="h-12 w-12 rounded-xl object-cover"
            />
          )}
          <input
            id={id("gambar")}
            name="gambar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="w-full text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={proses}
          className="min-h-11 flex-1 rounded-full bg-hijau px-5 py-3 font-semibold text-krem disabled:opacity-50"
        >
          {proses ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onBatal}
          className="min-h-11 rounded-full border-2 border-hijau px-5 py-3 font-semibold text-hijau"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
