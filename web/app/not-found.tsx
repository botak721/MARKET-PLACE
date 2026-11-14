import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KATEGORI } from "@/lib/kategori";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <p className="font-judul text-7xl font-extrabold text-biru sm:text-8xl">
          404
        </p>
        <h1 className="font-judul mt-4 text-2xl font-bold sm:text-3xl">
          Halaman yang kamu cari tidak ditemukan
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Alamatnya mungkin salah, atau produk dan toko yang kamu cari sudah
          dihapus penjualnya.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-biru px-6 font-semibold text-white shadow-md shadow-biru/20 transition-colors hover:bg-biru-tua"
          >
            Kembali ke beranda
          </Link>
          <Link
            href="/#produk"
            className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-6 font-semibold transition-colors hover:bg-slate-50"
          >
            Lihat semua produk
          </Link>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-kartu">
          <form action="/cari" role="search">
            <label htmlFor="cari-404" className="font-judul text-lg font-bold">
              Cari produk yang kamu inginkan
            </label>
            <div className="relative mt-3 flex gap-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="cari-404"
                type="search"
                name="q"
                required
                placeholder="Nama produk atau toko"
                className="h-12 min-w-0 flex-1 rounded-full border-[1.5px] border-slate-300 bg-white pr-4 pl-12 text-sm outline-none focus:border-biru focus:ring-4 focus:ring-biru/15"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-gelap"
              >
                Cari
              </button>
            </div>
          </form>
          <p className="mt-5 text-sm font-bold text-slate-600">Atau lihat kategori</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {KATEGORI.map((k) => (
              <li key={k.slug}>
                <Link
                  href={`/?kategori=${k.slug}#produk`}
                  className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold transition-colors hover:bg-slate-50"
                >
                  {k.nama}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
