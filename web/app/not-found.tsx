import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-[5vw] py-20 text-center">
        <p className="font-judul text-6xl font-bold text-hijau">404</p>
        <h1 className="font-judul mt-4 text-2xl font-bold">
          Halaman tidak ditemukan
        </h1>
        <p className="mx-auto mt-3 max-w-[42ch]">
          Alamatnya mungkin salah, atau produk dan toko yang kamu cari sudah
          dihapus penjualnya.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-hijau px-6 font-semibold text-krem"
          >
            Ke halaman utama
          </Link>
          <Link
            href="/#produk"
            className="inline-flex min-h-11 items-center rounded-full border-2 border-hijau px-6 font-semibold text-hijau"
          >
            Lihat semua produk
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}