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
        <section className="bg-hijau text-krem">
          <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-[5vw] py-10 md:grid-cols-[1.1fr_1fr] md:py-14">
            <div>
              <h1 className="font-judul max-w-[16ch] text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] font-bold">
                Barang bagus dari toko-toko kecil
              </h1>
              <p className="mt-4 max-w-[46ch] text-krem/85 sm:text-lg">
                Tiap penjual punya etalasenya sendiri. Pilih barangnya, bayar
                sekali, dan tiap toko mengirim pesanannya masing-masing.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#produk"
                  className="inline-flex min-h-11 items-center rounded-full bg-kunyit px-6 font-semibold text-tinta"
                >
                  Mulai belanja
                </a>
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-krem px-6 font-semibold text-krem"
                >
                  Buka tokomu
                </Link>
              </div>
              <Suspense fallback={<p className="mt-6 h-5" />}>
                <Statistik />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <FotoHero />
            </Suspense>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px]">
          <Suspense fallback={null}>
            <ProdukPilihan />
          </Suspense>
          <Suspense fallback={null}>
            <JelajahToko />
          </Suspense>
          <div id="produk" className="scroll-mt-20">
            <Suspense
              fallback={<p className="px-[5vw] py-6">Memuat produk...</p>}
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