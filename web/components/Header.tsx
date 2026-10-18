import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hijau/10 bg-krem/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-2 px-[5vw] py-3 md:gap-x-6 md:py-4">
        <Link
          href="/"
          className="font-judul order-1 text-xl font-bold whitespace-nowrap text-hijau md:text-2xl"
        >
          Rizki Online Shop
        </Link>
        <div className="order-2 ml-auto md:order-3 md:ml-0">
          <AuthNav />
        </div>
        <form
          action="/cari"
          className="order-3 w-full md:order-2 md:w-auto md:min-w-[200px] md:flex-1"
        >
          <input
            type="search"
            name="q"
            required
            placeholder="Cari barang atau toko"
            className="w-full rounded-full border-2 border-hijau bg-transparent px-5 py-2 md:py-3"
          />
        </form>
      </div>
    </header>
  );
}
