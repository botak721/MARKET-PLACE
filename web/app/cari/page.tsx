import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DaftarProduk from "@/components/DaftarProduk";
import { satu, type ParamMentah } from "@/lib/daftar-produk";

export const metadata: Metadata = {
  title: "Cari produk",
  robots: { index: false },
};

async function Hasil({ searchParams }: { searchParams: Promise<ParamMentah> }) {
  const param = await searchParams;
  const kata = (satu(param.q) ?? "").trim();
  await connection();

  if (!kata) {
    return (
      <p className="px-[5vw] py-12">Ketik nama barang atau toko yang dicari.</p>
    );
  }

  return (
    <>
      <section className="px-[5vw] pt-12 pb-2">
        <h1 className="font-judul text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold">
          {`Hasil untuk "${kata}"`}
        </h1>
      </section>
      <DaftarProduk dasar="/cari" param={param} kata={kata} />
    </>
  );
}

export default function CariPage({
  searchParams,
}: {
  searchParams: Promise<ParamMentah>;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px]">
        <Suspense fallback={<p className="px-[5vw] py-12">Mencari...</p>}>
          <Hasil searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}