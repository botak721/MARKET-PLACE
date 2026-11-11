"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Info, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";
import { warnaDari } from "@/lib/warna";
import { kabarKeranjang } from "@/lib/keranjang-event";
import { ambilKeranjang, ubahJumlah, hapusDariKeranjang } from "./actions";

type Item = Awaited<ReturnType<typeof ambilKeranjang>>[number];

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

const langkah =
  "flex h-11 w-11 items-center justify-center rounded-full text-tinta transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent";

export default function KeranjangPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [item, setItem] = useState<Item[] | undefined>(undefined);
  const [merapikan, setMerapikan] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/sign-in");
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) ambilKeranjang().then(setItem);
  }, [userId]);

  async function segarkan() {
    setItem(await ambilKeranjang());
    kabarKeranjang();
  }

  async function ubah(productId: number, jumlah: number) {
    await ubahJumlah(productId, jumlah);
    await segarkan();
  }

  async function hapus(productId: number) {
    await hapusDariKeranjang(productId);
    await segarkan();
  }

  async function rapikan() {
    if (!item) return;
    setMerapikan(true);
    for (const i of item) {
      if (i.stok <= 0) await hapusDariKeranjang(i.productId);
      else if (i.jumlah > i.stok) await ubahJumlah(i.productId, i.stok);
    }
    setMerapikan(false);
    await segarkan();
  }

  if (isPending || item === undefined) {
    return (
      <>
        <Header />
        <p className="px-4 py-12 text-center sm:px-6">Memuat keranjang...</p>
      </>
    );
  }

  const perToko = Object.values(
    item.reduce<
      Record<number, { toko: string; slug: string; barang: Item[] }>
    >((acc, i) => {
      (acc[i.tokoId] ??= { toko: i.toko, slug: i.tokoSlug, barang: [] }).barang.push(i);
      return acc;
    }, {}),
  );
  const total = item.reduce((s, i) => s + i.harga * i.jumlah, 0);
  const jumlahBarang = item.reduce((s, i) => s + i.jumlah, 0);
  const bermasalah = item.some((i) => i.stok <= 0 || i.jumlah > i.stok);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="font-judul text-3xl font-bold sm:text-4xl">
            Keranjang belanja
          </h1>
          {item.length > 0 && (
            <span className="mb-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-biru-tua">
              {item.length} produk dari {perToko.length} toko
            </span>
          )}
        </div>

        {item.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-kartu">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-biru">
              <ShoppingBag className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 className="font-judul mt-5 text-xl font-bold">
              Keranjangmu masih kosong
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Pilih barang dari berbagai toko, lalu bayar sekali untuk semuanya.
            </p>
            <Link
              href="/#produk"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-biru px-6 font-semibold text-white transition-colors hover:bg-biru-tua"
            >
              Mulai belanja
            </Link>
          </div>
        ) : (
          <>
            {bermasalah && (
              <div
                role="alert"
                className="mt-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-biru" aria-hidden="true" />
                  <div>
                    <p className="font-bold">Ketersediaan stok perlu disesuaikan</p>
                    <p className="mt-1 text-sm text-slate-700">
                      Ada barang yang habis atau jumlahnya melebihi stok. Checkout
                      aktif lagi setelah itu diperbaiki. Rapikan otomatis menghapus
                      barang yang habis dan menurunkan jumlah sesuai stok.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={rapikan}
                  disabled={merapikan}
                  className="min-h-11 shrink-0 rounded-full bg-biru px-5 text-sm font-semibold text-white transition-colors hover:bg-biru-tua disabled:opacity-60"
                >
                  {merapikan ? "Merapikan..." : "Rapikan otomatis"}
                </button>
              </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
              <div className="space-y-5">
                {perToko.map((grup) => {
                  const warna = warnaDari(grup.toko);
                  const huruf = (Array.from(grup.toko.trim())[0] ?? "?").toUpperCase();
                  const subtotal = grup.barang.reduce(
                    (s, b) => s + b.harga * b.jumlah,
                    0,
                  );
                  return (
                    <section
                      key={grup.toko}
                      aria-label={`Barang dari ${grup.toko}`}
                      className="rounded-2xl border border-slate-200 bg-white shadow-kartu"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                            style={{ backgroundColor: warna.bg, color: warna.teks }}
                          >
                            {huruf}
                          </span>
                          <h2 className="font-judul truncate text-lg font-bold">
                            {grup.toko}
                          </h2>
                        </div>
                        <Link
                          href={`/toko/${grup.slug}`}
                          className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-slate-100 px-4 text-sm font-semibold transition-colors hover:bg-slate-200"
                        >
                          Kunjungi toko
                        </Link>
                      </div>

                      <ul className="divide-y divide-slate-100">
                        {grup.barang.map((b) => {
                          const habis = b.stok <= 0;
                          const lebih = b.jumlah > b.stok;
                          return (
                            <li key={b.productId} className="space-y-3 px-5 py-4">
                              <div className="flex gap-4">
                                <Link
                                  href={`/produk/${b.productId}`}
                                  className="block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                                >
                                  {b.gambar ? (
                                    <img
                                      src={b.gambar}
                                      alt={b.nama}
                                      loading="lazy"
                                      className={`h-full w-full object-cover ${habis ? "opacity-60" : ""}`}
                                    />
                                  ) : (
                                    <span
                                      aria-hidden="true"
                                      className="font-judul flex h-full w-full items-center justify-center text-2xl font-bold"
                                      style={{ backgroundColor: warna.bg, color: warna.teks }}
                                    >
                                      {(Array.from(b.nama.trim())[0] ?? "?").toUpperCase()}
                                    </span>
                                  )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                  <Link
                                    href={`/produk/${b.productId}`}
                                    className="line-clamp-2 font-bold hover:underline"
                                  >
                                    {b.nama}
                                  </Link>
                                  <p className="font-judul mt-1 font-bold text-biru tabular-nums">
                                    {rupiah(b.harga)}
                                  </p>
                                  {habis ? (
                                    <p className="mt-1 text-xs font-semibold text-red-600">
                                      Stok habis. Hapus barang ini untuk lanjut checkout.
                                    </p>
                                  ) : lebih ? (
                                    <p className="mt-1 text-xs font-semibold text-red-600">
                                      Stok tersisa {b.stok}, kurangi jumlahnya.
                                    </p>
                                  ) : b.stok <= 5 ? (
                                    <p className="mt-1 text-xs text-slate-600">
                                      Stok tersisa {b.stok}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div
                                  role="group"
                                  aria-label={`Jumlah ${b.nama}`}
                                  className="flex items-center rounded-full border border-slate-300"
                                >
                                  <button
                                    type="button"
                                    onClick={() => ubah(b.productId, b.jumlah - 1)}
                                    disabled={b.jumlah <= 1}
                                    aria-label={`Kurangi jumlah ${b.nama}`}
                                    className={langkah}
                                  >
                                    <Minus className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                  <span
                                    aria-live="polite"
                                    className={`w-10 text-center font-semibold tabular-nums ${lebih ? "text-red-600" : ""}`}
                                  >
                                    {b.jumlah}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => ubah(b.productId, b.jumlah + 1)}
                                    disabled={b.jumlah >= b.stok}
                                    aria-label={`Tambah jumlah ${b.nama}`}
                                    className={langkah}
                                  >
                                    <Plus className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-xs text-slate-600">Subtotal</p>
                                    <p className="font-bold tabular-nums">
                                      {rupiah(b.harga * b.jumlah)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => hapus(b.productId)}
                                    aria-label={`Hapus ${b.nama} dari keranjang`}
                                    className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <p className="flex items-center justify-between gap-3 rounded-b-2xl bg-slate-50 px-5 py-3 text-sm">
                        <span className="text-slate-600">Subtotal {grup.toko}</span>
                        <span className="font-bold tabular-nums">{rupiah(subtotal)}</span>
                      </p>
                    </section>
                  );
                })}
              </div>

              <aside
                aria-label="Ringkasan belanja"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-kartu lg:sticky lg:top-24"
              >
                <h2 className="font-judul text-xl font-bold">Ringkasan belanja</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-600">Total harga ({jumlahBarang} barang)</dt>
                    <dd className="font-semibold tabular-nums">{rupiah(total)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-600">Ongkos kirim</dt>
                    <dd className="text-slate-600">Belum diterapkan</dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-600">Total tagihan</p>
                  <p className="font-judul text-3xl font-extrabold tabular-nums">
                    {rupiah(total)}
                  </p>
                </div>

                {bermasalah ? (
                  <>
                    <span
                      aria-disabled="true"
                      className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600"
                    >
                      Checkout
                    </span>
                    <p role="status" className="mt-3 text-sm text-red-600">
                      Ada barang yang stoknya tidak cukup. Perbaiki dulu sebelum
                      checkout.
                    </p>
                  </>
                ) : (
                  <Link
                    href="/checkout"
                    className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-biru font-semibold text-white shadow-lg shadow-biru/25 transition-all hover:bg-biru-tua active:scale-[0.99]"
                  >
                    Checkout ({jumlahBarang})
                  </Link>
                )}
                <p className="mt-3 text-xs text-slate-600">
                  Barang dari toko berbeda dipecah jadi pesanan terpisah, tapi
                  dibayar sekali.
                </p>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
