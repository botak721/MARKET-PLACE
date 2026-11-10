import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DaftarProduk from "@/components/DaftarProduk";
import Statistik from "@/components/Statistik";
import ProdukPilihan from "@/components/ProdukPilihan";
import JelajahToko from "@/components/JelajahToko";
import FotoHero from "@/components/FotoHero";
import type { ParamMentah } from "@/lib/daftar-produk";

async function Daftar({ searchParams }: { searchParams: Promise<ParamMentah> }) {
  const param = await searchParams;
  return <DaftarProduk dasar="/" param={param} hash="#produk" />;
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<ParamMentah>;
}) {
  return (
    <>
      <Header />

      <main>
        <section className="relative overflow-hidden bg-navy text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-biru/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-biru-tua/20 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 animate-pulse rounded-full bg-biru motion-reduce:animate-none"
                />
                Marketplace multi-penjual
              </p>
              <h1 className="font-judul max-w-[18ch] text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.1] font-extrabold tracking-tight">
                Satu keranjang untuk banyak toko kecil
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Setiap toko punya etalasenya sendiri. Kamu bayar sekali, dan tiap
                toko mengirim pesanannya sendiri.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="#produk"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-biru px-8 font-semibold text-white shadow-lg shadow-biru/30 transition-all hover:bg-biru-tua active:scale-95"
                >
                  Mulai belanja
                </a>
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 font-semibold text-white transition-all hover:border-white hover:bg-white/10 active:scale-95"
                >
                  Buka tokomu
                </Link>
              </div>
              <Suspense fallback={<div className="h-20" />}>
                <Statistik />
              </Suspense>
            </div>
            <div className="lg:col-span-5">
              <Suspense fallback={null}>
                <FotoHero />
              </Suspense>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px]">
          <Suspense fallback={null}>
            <ProdukPilihan />
          </Suspense>
          <Suspense fallback={null}>
            <JelajahToko />
          </Suspense>
          <div id="produk" className="scroll-mt-24">
            <h2 className="font-judul px-4 pt-12 text-2xl font-bold sm:px-6 sm:text-3xl">
              Semua produk
            </h2>
            <Suspense
              fallback={<p className="px-4 py-6 sm:px-6">Memuat produk...</p>}
            >
              <Daftar searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
