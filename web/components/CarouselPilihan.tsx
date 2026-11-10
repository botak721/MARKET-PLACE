"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Award } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export type ItemPilihan = {
  id: number;
  nama: string;
  toko: string;
  slug: string;
  harga: number;
  gambar: string;
  stok: number;
  rata?: number;
  jumlahUlasan?: number;
  lencana?: string;
};

export default function CarouselPilihan({ items }: { items: ItemPilihan[] }) {
  const jalur = useRef<HTMLUListElement>(null);

  function geser(arah: -1 | 1) {
    const el = jalur.current;
    if (!el) return;
    const kurangiGerak = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollBy({
      left: arah * el.clientWidth * 0.8,
      behavior: kurangiGerak ? "auto" : "smooth",
    });
  }

  const panah =
    "flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-tinta transition-colors hover:bg-slate-300";

  return (
    <section aria-labelledby="judul-pilihan" className="px-4 pt-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-biru uppercase">
            <Award className="h-4 w-4" aria-hidden="true" />
            Pilihan
          </p>
          <h2
            id="judul-pilihan"
            className="font-judul text-2xl font-bold sm:text-3xl"
          >
            Produk pilihan
          </h2>
          <p className="mt-1 text-slate-600">
            Yang paling banyak diulas dan masih tersedia.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => geser(-1)}
            aria-label="Geser ke kiri"
            className={panah}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => geser(1)}
            aria-label="Geser ke kanan"
            className={panah}
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={jalur}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pt-1 pb-4 sm:gap-5"
      >
        {items.map((p) => (
          <li key={p.id} className="w-60 shrink-0 snap-start sm:w-72">
            <ProductCard
              id={p.id}
              nama={p.nama}
              toko={p.toko}
              slug={p.slug}
              harga={p.harga}
              gambar={p.gambar}
              stok={p.stok}
              rata={p.rata}
              jumlahUlasan={p.jumlahUlasan}
              lencana={p.lencana}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
