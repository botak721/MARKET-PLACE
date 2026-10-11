export default function Header() {
  return (
    <header className="mx-auto flex max-w-[1200px] items-center gap-6 px-[5vw] py-5">
      <a
        href="#"
        className="font-judul text-2xl font-bold whitespace-nowrap text-hijau"
      >
        Rizki Online Shop
      </a>
      <input
        type="search"
        placeholder="Cari barang yang lu mau"
        className="flex-1 rounded-full border-2 border-hijau bg-transparent px-5 py-3"
      />
    </header>
  );
}