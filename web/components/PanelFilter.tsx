"use client";

import { useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export default function PanelFilter({
  jumlahAktif,
  children,
}: {
  jumlahAktif: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-hijau px-4 text-sm font-semibold text-hijau lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter{jumlahAktif > 0 ? ` (${jumlahAktif})` : ""}
      </button>

      <dialog
        ref={ref}
        aria-labelledby="judul-filter"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="fixed inset-x-0 top-auto bottom-0 m-0 h-auto max-h-[85svh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-kartu p-0 text-tinta backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between border-b border-hijau/15 px-5 py-2">
          <h2 id="judul-filter" className="font-judul text-lg font-bold">
            Filter
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Tutup filter"
            className="flex h-11 w-11 items-center justify-center rounded-full"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </dialog>
    </>
  );
}