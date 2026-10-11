import ProductCard from "@/components/ProductCard";

const produk = [
  { id: 1, nama: "Tas Anyaman Rotan", toko: "Toko Rotan Kita", harga: 185000 },
  { id: 2, nama: "Kopi Gayo 250 gram", toko: "Kopi Pagi", harga: 72000 },
  { id: 3, nama: "Tote Bag Kanvas", toko: "Kanvas Lokal", harga: 89000 },
  { id: 4, nama: "Lilin Aromaterapi", toko: "Nyala Studio", harga: 65000 },
];

export default function Home() {
  return (
    <>
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

      <main className="mx-auto max-w-[1200px]">
        <section className="px-[5vw] pt-12 pb-6">
          <h1 className="font-judul max-w-[14ch] text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] font-bold">
            Barang bagus dari toko-toko kecil
          </h1>
          <p className="mt-3">Tiap penjual punya etalasenya sendiri.</p>
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-[5vw] pt-6 pb-16">
          {produk.map((p) => (
            <ProductCard key={p.id} nama={p.nama} toko={p.toko} harga={p.harga} />
          ))}
        </section>
      </main>
    </>
  );
}