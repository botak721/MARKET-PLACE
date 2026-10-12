import Link from "next/link";

export default function Header() {
  return (
    <header className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3 px-[5vw] py-5">
      <Link
        href="/"
        className="font-judul text-2xl font-bold whitespace-nowrap text-hijau"
      >
        Rizki Online Shop
      </Link>
      <input
        type="search"
        placeholder="Cari barang yang lu mau"
        className="min-w-[200px] flex-1 rounded-full border-2 border-hijau bg-transparent px-5 py-3"
      />
      <nav className="flex items-center gap-3 whitespace-nowrap">
        <Link href="/sign-in" className="font-semibold text-hijau">
          Masuk
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-hijau px-4 py-2 font-semibold text-krem"
        >
          Daftar
        </Link>
      </nav>
    </header>
  );
}