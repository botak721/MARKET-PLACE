"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { warnaDari } from "@/lib/warna";

export type ItemPilihan = {
  id: number;
  nama: string;
  harga: number;
  gambar: string;
  kategori: string | null;
  toko: string;
  info: string | null;
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

  const tombolPanah =
    "absolute top-1/3 z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-hijau/20 bg-kartu/90 text-hijau opacity-0 backdrop-blur-sm transition-opacity group-hover/car:opacity-100 focus-visible:opacity-100 md:flex";

  return (
    <div className="group/car relative">
      <button
        onClick={() => geser(-1)}
        aria-label="Geser ke kiri"
        className={`${tombolPanah} left-2`}
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>

      <ul
        ref={jalur}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
      >
        {items.map((p) => {
          const warna = warnaDari(p.toko);
          const huruf = (Array.from(p.toko.trim())[0] ?? "?").toUpperCase();
          return (
            <li key={p.id} className="shrink-0 snap-start">
              <Link
                href={`/produk/${p.id}`}
                className="group relative block h-[360px] w-[250px] overflow-hidden rounded-3xl bg-kartu transition-transform duration-300 hover:-translate-y-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-[280px]"
              >
                <div className="relative h-1/2 overflow-hidden">
                  <Image
                    src={p.gambar}
                    alt=""
                    fill
                    sizes="280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex h-1/2 flex-col justify-between p-4">
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs opacity-70">
                      <Tag className="h-3.5 w-3.5 text-hijau" aria-hidden="true" />
                      {p.kategori ?? "Produk pilihan"}
                    </p>
                    <h3 className="font-judul line-clamp-2 text-lg leading-tight font-bold">
                      {p.nama}
                    </h3>
                    <p className="font-semibold text-hijau">
                      Rp{p.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-hijau/15 pt-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                        style={{ backgroundColor: warna.bg, color: warna.teks }}
                      >
                        {huruf}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{p.toko}</p>
                        {p.info && <p className="text-xs opacity-70">{p.info}</p>}
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e3ecdf] text-hijau transition-transform duration-300 group-hover:-rotate-45 group-hover:bg-hijau group-hover:text-krem motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => geser(1)}
        aria-label="Geser ke kanan"
        className={`${tombolPanah} right-2`}
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}