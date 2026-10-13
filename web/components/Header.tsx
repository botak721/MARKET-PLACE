import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function Header() {
  return (
    <header className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3 px-[5vw] py-5">
      <Link
        href="/"
        className="font-judul text-2xl font-bold whitespace-nowrap text-hijau"
      >
        Rizki Online Shop
      </Link>
      <form action="/cari" className="min-w-[200px] flex-1">
        <input
          type="search"
          name="q"
          required
          placeholder="Cari barang atau toko"
          className="w-full rounded-full border-2 border-hijau bg-transparent px-5 py-3"
        />
      </form>
      <AuthNav />
    </header>
  );
}