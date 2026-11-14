"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Search } from "lucide-react";
import { upload } from "@vercel/blob/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FormEditProduk from "@/components/FormEditProduk";
import RingkasanPenjualan from "@/components/RingkasanPenjualan";
import { useSession, signOut } from "@/lib/auth-client";
import { KATEGORI, namaKategori } from "@/lib/kategori";
import { warnaDari } from "@/lib/warna";
import {
  ambilTokoSaya,
  bukaToko,
  ambilProdukSaya,
  tambahProduk,
  hapusProduk,
} from "./actions";

type Toko = { id: number; nama: string; slug: string } | null;
type Produk = {
  id: number;
  nama: string;
  harga: number;
  gambar: string | null;
  stok: number;
  deskripsi: string | null;
  kategori: string | null;
};

const kolom =
  "h-12 w-full rounded-2xl border-[1.5px] border-slate-300 bg-white px-4 text-sm outline-none focus:border-biru focus:ring-4 focus:ring-biru/15";
const area =
  "w-full rounded-2xl border-[1.5px] border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-biru focus:ring-4 focus:ring-biru/15";
const label = "mb-1 block text-sm font-bold";
const kartu = "rounded-2xl border border-slate-200 bg-white shadow-kartu";

const SARINGAN = [
  { kode: "semua", nama: "Semua" },
  { kode: "rendah", nama: "Stok rendah" },
  { kode: "habis", nama: "Stok habis" },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [toko, setToko] = useState<Toko | undefined>(undefined);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [sedangEdit, setSedangEdit] = useState<number | null>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const urlLama = useRef<string | null>(null);
  const [cari, setCari] = useState("");
  const [saring, setSaring] = useState<(typeof SARINGAN)[number]["kode"]>("semua");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) {
      ambilTokoSaya().then(setToko);
      ambilProdukSaya().then(setProduk);
    }
  }, [userId]);

  useEffect(
    () => () => {
      if (urlLama.current) URL.revokeObjectURL(urlLama.current);
    },
    [],
  );

  function ubahPratinjau(file: File | undefined) {
    if (urlLama.current) URL.revokeObjectURL(urlLama.current);
    urlLama.current = file ? URL.createObjectURL(file) : null;
    setPratinjau(urlLama.current);
  }

  async function handleBukaToko(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const hasil = await bukaToko(new FormData(e.currentTarget));
    if (hasil.error) {
      setError(hasil.error);
    } else {
      setToko(await ambilTokoSaya());
    }
  }

  async function handleTambah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    setMengunggah(true);
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
      const hasil = await tambahProduk(data);
      if (hasil.error) {
        setError(hasil.error);
      } else {
        form.reset();
        ubahPratinjau(undefined);
        setProduk(await ambilProdukSaya());
      }
    } catch {
      setError("Gagal mengunggah gambar. Coba lagi.");
    } finally {
      setMengunggah(false);
    }
  }

  async function handleHapus(id: number, nama: string) {
    if (
      !confirm(
        `Hapus "${nama}"? Produk, foto, dan ulasannya akan dihapus permanen.`,
      )
    ) {
      return;
    }
    await hapusProduk(id);
    setProduk(await ambilProdukSaya());
  }

  if (isPending) {
    return (
      <>
        <Header />
        <p className="px-4 py-12 text-center sm:px-6">Memuat...</p>
      </>
    );
  }
  if (!session?.user) {
    return (
      <>
        <Header />
        <p className="px-4 py-12 text-center sm:px-6">Mengalihkan...</p>
      </>
    );
  }

  const { user } = session;
  const warna = toko ? warnaDari(toko.nama) : null;
  const jumlahRendah = produk.filter((p) => p.stok > 0 && p.stok <= 5).length;
  const jumlahHabis = produk.filter((p) => p.stok === 0).length;
  const hitung = { semua: produk.length, rendah: jumlahRendah, habis: jumlahHabis };
  const kata = cari.trim().toLowerCase();
  const tampil = produk.filter((p) => {
    if (saring === "rendah" && !(p.stok > 0 && p.stok <= 5)) return false;
    if (saring === "habis" && p.stok !== 0) return false;
    return kata === "" || p.nama.toLowerCase().includes(kata);
  });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-judul text-3xl font-bold sm:text-4xl">
            Dashboard penjual
          </h1>
          <p className="mt-1 text-slate-600">Halo, {user.name}.</p>
        </div>

        {toko === undefined && <p>Memuat toko...</p>}

        {toko === null && (
          <section className={`${kartu} mx-auto max-w-md p-6`}>
            <h2 className="font-judul text-xl font-bold">Mau jualan? Buka tokomu</h2>
            <p className="mt-1 text-sm text-slate-600">
              Beri nama tokomu. Setelah itu kamu bisa langsung menambahkan produk.
            </p>
            <form onSubmit={handleBukaToko} className="mt-5 space-y-4">
              {error && (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}
              <div>
                <label htmlFor="nama-toko" className={label}>
                  Nama toko
                </label>
                <input
                  id="nama-toko"
                  name="nama"
                  placeholder="Contoh: Kopi Pagi"
                  required
                  minLength={3}
                  className={kolom}
                />
              </div>
              <button
                type="submit"
                className="h-12 w-full rounded-full bg-biru font-semibold text-white shadow-lg shadow-biru/25 transition-colors hover:bg-biru-tua"
              >
                Buka toko
              </button>
            </form>
          </section>
        )}

        {toko && warna && (
          <>
            <section
              aria-label="Toko kamu"
              className={`${kartu} flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  aria-hidden="true"
                  className="font-judul flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-extrabold"
                  style={{ backgroundColor: warna.bg, color: warna.teks }}
                >
                  {(Array.from(toko.nama.trim())[0] ?? "?").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-600">Toko kamu</p>
                  <h2 className="font-judul truncate text-2xl font-bold">
                    {toko.nama}
                  </h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/toko/${toko.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full bg-slate-100 px-5 text-sm font-semibold transition-colors hover:bg-slate-200"
                >
                  Lihat etalase
                </Link>
                <Link
                  href="/dashboard/pesanan"
                  className="inline-flex min-h-11 items-center rounded-full bg-biru px-5 text-sm font-semibold text-white shadow-md shadow-biru/20 transition-colors hover:bg-biru-tua"
                >
                  Pesanan masuk
                </Link>
              </div>
            </section>

            <RingkasanPenjualan tokoId={toko.id} tokoNama={toko.nama} produk={produk} />

            <section aria-labelledby="judul-tambah" className={`${kartu} p-6`}>
              <h2 id="judul-tambah" className="font-judul text-xl font-bold">
                Tambah produk baru
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Lengkapi informasi supaya pembeli mudah menemukan dan memutuskan.
              </p>
              <form onSubmit={handleTambah} className="mt-5 space-y-4">
                {error && (
                  <p role="alert" className="text-sm font-semibold text-red-600">
                    {error}
                  </p>
                )}
                <div>
                  <label htmlFor="tambah-nama" className={label}>
                    Nama produk
                  </label>
                  <input id="tambah-nama" name="nama" required className={kolom} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="tambah-harga" className={label}>
                      Harga (rupiah)
                    </label>
                    <input
                      id="tambah-harga"
                      name="harga"
                      type="number"
                      inputMode="numeric"
                      required
                      min={100}
                      className={kolom}
                    />
                  </div>
                  <div>
                    <label htmlFor="tambah-stok" className={label}>
                      Stok
                    </label>
                    <input
                      id="tambah-stok"
                      name="stok"
                      type="number"
                      inputMode="numeric"
                      required
                      min={0}
                      defaultValue={1}
                      className={kolom}
                    />
                  </div>
                  <div>
                    <label htmlFor="tambah-kategori" className={label}>
                      Kategori
                    </label>
                    <select
                      id="tambah-kategori"
                      name="kategori"
                      defaultValue=""
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
                </div>
                <div>
                  <label htmlFor="tambah-deskripsi" className={label}>
                    Deskripsi (boleh dikosongkan)
                  </label>
                  <textarea
                    id="tambah-deskripsi"
                    name="deskripsi"
                    maxLength={1000}
                    rows={4}
                    className={area}
                  />
                </div>
                <div>
                  <label htmlFor="tambah-gambar" className={label}>
                    Foto produk (boleh dikosongkan)
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500">
                      {pratinjau ? (
                        <img src={pratinjau} alt="Pratinjau foto" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-7 w-7" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        id="tambah-gambar"
                        name="gambar"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => ubahPratinjau(e.target.files?.[0])}
                        className="w-full text-sm"
                      />
                      <p className="mt-1 text-xs text-slate-600">
                        JPG, PNG, atau WebP, maksimal 5 MB.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={mengunggah}
                  className="h-12 w-full rounded-full bg-biru font-semibold text-white shadow-lg shadow-biru/25 transition-colors hover:bg-biru-tua disabled:opacity-60 sm:w-auto sm:px-10"
                >
                  {mengunggah ? "Mengunggah..." : "Simpan produk"}
                </button>
              </form>
            </section>

            <section aria-labelledby="judul-daftar" className={`${kartu} p-6`}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 id="judul-daftar" className="font-judul text-xl font-bold">
                    Produk di tokomu ({produk.length})
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Pantau stok dan harga, lalu ubah kapan saja.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    aria-label="Cari produk di tokomu"
                    placeholder="Cari nama produk"
                    className={`${kolom} pl-10`}
                  />
                </div>
              </div>

              <div
                role="group"
                aria-label="Saring berdasarkan stok"
                className="mt-4 flex flex-wrap gap-2"
              >
                {SARINGAN.map((s) => (
                  <button
                    key={s.kode}
                    type="button"
                    onClick={() => setSaring(s.kode)}
                    aria-pressed={saring === s.kode}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
                      saring === s.kode
                        ? "border-navy bg-navy text-white"
                        : "border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {s.nama}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${saring === s.kode ? "bg-white/20" : "bg-slate-100"}`}
                    >
                      {hitung[s.kode]}
                    </span>
                  </button>
                ))}
              </div>

              {produk.length === 0 && (
                <p className="mt-6 text-sm text-slate-600">Belum ada produk.</p>
              )}
              {produk.length > 0 && tampil.length === 0 && (
                <p className="mt-6 text-sm text-slate-600">
                  Tidak ada produk yang cocok dengan saringan ini.
                </p>
              )}

              <ul className="mt-4 space-y-3">
                {tampil.map((p) =>
                  sedangEdit === p.id ? (
                    <li key={p.id}>
                      <FormEditProduk
                        produk={p}
                        onBatal={() => setSedangEdit(null)}
                        onSelesai={async () => {
                          setSedangEdit(null);
                          setProduk(await ambilProdukSaya());
                        }}
                      />
                    </li>
                  ) : (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-slate-200 p-4"
                    >
                      <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {p.gambar ? (
                          <img
                            src={p.gambar}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="font-judul flex h-full w-full items-center justify-center text-lg font-bold"
                            style={{ backgroundColor: warna.bg, color: warna.teks }}
                          >
                            {(Array.from(p.nama.trim())[0] ?? "?").toUpperCase()}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="line-clamp-2 font-bold">{p.nama}</p>
                        <p className="text-sm text-slate-600">
                          {namaKategori(p.kategori) ?? "Tanpa kategori"}
                        </p>
                      </div>
                      <p className="font-bold text-biru tabular-nums">
                        Rp{p.harga.toLocaleString("id-ID")}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold tabular-nums ${
                          p.stok === 0
                            ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                            : p.stok <= 5
                              ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.stok === 0 ? "Stok habis" : `${p.stok} unit`}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setSedangEdit(p.id)}
                          aria-label={`Edit ${p.nama}`}
                          className="min-h-11 rounded-full px-4 text-sm font-semibold text-biru transition-colors hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHapus(p.id, p.nama)}
                          aria-label={`Hapus ${p.nama}`}
                          className="min-h-11 rounded-full px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </section>
          </>
        )}

        <div>
          <button
            type="button"
            onClick={() =>
              signOut({ fetchOptions: { onSuccess: () => router.push("/") } })
            }
            className="min-h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold transition-colors hover:bg-slate-50"
          >
            Keluar dari akun
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
