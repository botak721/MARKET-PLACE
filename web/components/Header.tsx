import Link from "next/link";
import { Search } from "lucide-react";
import AuthNav from "@/components/AuthNav";

function KolomCari({ rapat = false }: { rapat?: boolean }) {
  return (
    <form action="/cari" role="search" className="w-full">
      <div className="flex w-full items-center overflow-hidden rounded-full bg-white shadow-inner focus-within:ring-2 focus-within:ring-biru">
        <Search
          className="ml-3.5 h-5 w-5 shrink-0 text-slate-500"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          required
          aria-label="Cari produk atau toko"
          placeholder="Cari produk atau toko"
          className={`min-w-0 flex-1 bg-transparent px-2 text-sm text-tinta outline-none placeholder:text-slate-500 ${rapat ? "py-2.5" : "py-3"}`}
        />
        <button
          type="submit"
          className="m-1 min-h-9 rounded-full bg-biru px-5 text-sm font-semibold text-white transition-colors hover:bg-biru-tua"
        >
          Cari
        </button>
      </div>
    </form>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-navy-gelap text-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link
          href="/"
          className="font-judul shrink-0 text-lg font-bold tracking-tight sm:text-xl"
        >
          Rizki Online Shop
        </Link>
        <div className="hidden max-w-xl flex-1 md:block">
          <KolomCari />
        </div>
        <AuthNav />
      </div>
      <div className="px-4 pb-3 md:hidden">
        <KolomCari rapat />
      </div>
    </header>
  );
}
