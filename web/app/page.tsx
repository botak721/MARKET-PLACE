import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductList from "@/components/ProductList";
import Statistik from "@/components/Statistik";
import FilterKategori from "@/components/FilterKategori";

async function Daftar({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  return (
    <>
      <FilterKategori aktif={kategori} />
      <ProductList kategori={kategori} />
    </>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1200px]">
        <section className="px-[5vw] pt-10 pb-4 sm:pt-14">
          <h1 className="font-judul max-w-[16ch] text-[clamp(2rem,6vw,3.75rem)] leading-[1.08] font-bold">
            Barang bagus dari toko-toko kecil
          </h1>
          <p className="mt-3 max-w-[48ch] sm:text-lg">
            Tiap penjual punya etalasenya sendiri. Pilih barangnya, bayar
            sekali, dan tiap toko mengirim pesanannya masing-masing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#produk"
              className="rounded-full bg-hijau px-6 py-3 font-semibold text-krem"
            >
              Mulai belanja
            </a>
            <Link
              href="/dashboard"
              className="rounded-full border-2 border-hijau px-6 py-3 font-semibold text-hijau"
            >
              Buka tokomu
            </Link>
          </div>
          <Suspense fallback={<p className="mt-6 h-5" />}>
            <Statistik />
          </Suspense>
        </section>

        <div id="produk" className="scroll-mt-20">
          <Suspense
            fallback={<p className="px-[5vw] py-6">Memuat produk...</p>}
          >
            <Daftar searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </>
  );
}