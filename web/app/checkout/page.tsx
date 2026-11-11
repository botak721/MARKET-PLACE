"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";
import { warnaDari } from "@/lib/warna";
import { kabarKeranjang } from "@/lib/keranjang-event";
import { ambilKeranjang } from "@/app/keranjang/actions";
import { buatPesanan } from "@/app/pesanan/actions";

type Item = Awaited<ReturnType<typeof ambilKeranjang>>[number];

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [item, setItem] = useState<Item[] | undefined>(undefined);
  const [alamat, setAlamat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/sign-in");
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) ambilKeranjang().then(setItem);
  }, [userId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setProses(true);
    const hasil = await buatPesanan(alamat);
    setProses(false);
    if (hasil.error) {
      setError(hasil.error);
    } else {
      kabarKeranjang();
      router.push("/pesanan");
    }
  }

  if (isPending || item === undefined) {
    return (
      <>
        <Header />
        <p className="px-4 py-12 text-center sm:px-6">Memuat...</p>
      </>
    );
  }

  if (item.length === 0) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
          <h1 className="font-judul text-2xl font-bold">Keranjangmu kosong</h1>
          <p className="mt-2 text-slate-600">
            Tambahkan barang dulu sebelum checkout.
          </p>
          <Link
            href="/#produk"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-biru px-6 font-semibold text-white transition-colors hover:bg-biru-tua"
          >
            Mulai belanja
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const perToko = Object.values(
    item.reduce<Record<number, { toko: string; barang: Item[] }>>((acc, i) => {
      (acc[i.tokoId] ??= { toko: i.toko, barang: [] }).barang.push(i);
      return acc;
    }, {}),
  );
  const jumlahToko = perToko.length;
  const jumlahBarang = item.reduce((s, i) => s + i.jumlah, 0);
  const total = item.reduce((s, i) => s + i.harga * i.jumlah, 0);

  const langkah = [
    { nama: "Keranjang", selesai: true },
    { nama: "Pengiriman", aktif: true },
    { nama: "Pembayaran" },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/keranjang"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-biru hover:underline"
            >
              Kembali ke keranjang
            </Link>
            <h1 className="font-judul text-3xl font-bold sm:text-4xl">Checkout</h1>
          </div>
          <ol aria-label="Langkah checkout" className="flex items-center gap-2 text-sm">
            {langkah.map((l, i) => (
              <li
                key={l.nama}
                aria-current={l.aktif ? "step" : undefined}
                className="flex items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    l.selesai
                      ? "bg-blue-100 text-biru-tua"
                      : l.aktif
                        ? "bg-biru text-white"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {l.selesai ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={l.aktif ? "font-bold" : "text-slate-600"}>
                  {l.nama}
                </span>
                {i < langkah.length - 1 && (
                  <span aria-hidden="true" className="hidden h-px w-6 bg-slate-300 sm:block" />
                )}
              </li>
            ))}
          </ol>
        </div>

        {jumlahToko > 1 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-biru" aria-hidden="true" />
            <div>
              <p className="font-bold">Pesananmu akan dipecah per toko</p>
              <p className="mt-1 text-sm text-slate-700">
                Barangmu berasal dari {jumlahToko} toko. Tiap toko memproses dan
                mengirim pesanannya sendiri, tapi pembayarannya cukup sekali.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="space-y-5">
            <section
              aria-labelledby="judul-alamat"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-kartu"
            >
              <h2 id="judul-alamat" className="font-judul text-xl font-bold">
                Alamat pengiriman
              </h2>
              <form id="form-checkout" onSubmit={handleSubmit} className="mt-4 space-y-3">
                {error && (
                  <p role="alert" className="text-sm font-semibold text-red-600">
                    {error}
                  </p>
                )}
                <label htmlFor="alamat" className="block text-sm font-bold">
                  Nama penerima, alamat lengkap, dan nomor HP
                </label>
                <textarea
                  id="alamat"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  required
                  minLength={10}
                  rows={4}
                  placeholder="Contoh: Budi, Jl. Melati No. 5, Depok, 16424, 0812xxxxxxxx"
                  className="w-full rounded-2xl border-[1.5px] border-slate-300 bg-white px-4 py-3 outline-none focus:border-biru focus:ring-4 focus:ring-biru/15"
                />
                <p className="text-xs text-slate-600">Minimal 10 karakter.</p>
              </form>
            </section>

            {perToko.map((grup, idx) => {
              const warna = warnaDari(grup.toko);
              const huruf = (Array.from(grup.toko.trim())[0] ?? "?").toUpperCase();
              const subtotal = grup.barang.reduce((s, b) => s + b.harga * b.jumlah, 0);
              return (
                <section
                  key={grup.toko}
                  aria-label={`Pesanan dari ${grup.toko}`}
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
                    {jumlahToko > 1 && (
                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-biru-tua">
                        Pesanan {idx + 1} dari {jumlahToko}
                      </span>
                    )}
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {grup.barang.map((b) => (
                      <li key={b.productId} className="flex items-center gap-4 px-5 py-4">
                        <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {b.gambar ? (
                            <img
                              src={b.gambar}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="font-judul flex h-full w-full items-center justify-center text-xl font-bold"
                              style={{ backgroundColor: warna.bg, color: warna.teks }}
                            >
                              {(Array.from(b.nama.trim())[0] ?? "?").toUpperCase()}
                            </span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-bold">{b.nama}</p>
                          <p className="text-sm text-slate-600 tabular-nums">
                            {b.jumlah} barang × {rupiah(b.harga)}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold tabular-nums">
                          {rupiah(b.harga * b.jumlah)}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="flex items-center justify-between gap-3 rounded-b-2xl bg-slate-50 px-5 py-3 text-sm">
                    <span className="text-slate-600">Subtotal pesanan ini</span>
                    <span className="font-bold tabular-nums">{rupiah(subtotal)}</span>
                  </p>
                </section>
              );
            })}
          </div>

          <aside
            aria-label="Ringkasan pesanan"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-kartu lg:sticky lg:top-24"
          >
            <h2 className="font-judul text-xl font-bold">Ringkasan pesanan</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-xs text-slate-600">Total barang</p>
                <p className="font-judul text-xl font-bold">{jumlahBarang}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-xs text-slate-600">Pesanan terpisah</p>
                <p className="font-judul text-xl font-bold">{jumlahToko}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Total harga barang</dt>
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
            <button
              type="submit"
              form="form-checkout"
              disabled={proses}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-biru font-semibold text-white shadow-lg shadow-biru/25 transition-all hover:bg-biru-tua active:scale-[0.99] disabled:opacity-60"
            >
              {proses ? "Memproses..." : "Lanjut ke pembayaran"}
            </button>
            <p className="mt-3 text-xs text-slate-600">
              Pembayaran dilakukan di langkah berikutnya lewat Midtrans dalam mode
              uji coba, jadi tidak ada uang sungguhan yang berpindah.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
