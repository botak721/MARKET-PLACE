import { Suspense } from "react";
import Header from "@/components/Header";
import ProductList from "@/components/ProductList";

export default function Home() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1200px]">
        <section className="px-[5vw] pt-12 pb-6">
          <h1 className="font-judul max-w-[14ch] text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] font-bold">
            Barang bagus dari toko-toko kecil
          </h1>
          <p className="mt-3">Tiap penjual punya etalasenya sendiri.</p>
        </section>

        <Suspense fallback={<p className="px-[5vw] py-6">Memuat produk...</p>}>
          <ProductList />
        </Suspense>
      </main>
    </>
  );
}