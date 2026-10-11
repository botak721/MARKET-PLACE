type Props = {
  nama: string;
  toko: string;
  harga: number;
};

export default function ProductCard({ nama, toko, harga }: Props) {
  return (
    <article className="rounded-3xl bg-kartu p-3.5 pb-5 transition-transform hover:-translate-y-1.5">
      <div className="mb-3.5 aspect-square rounded-2xl bg-[#d9cdb8]" />
      <h2 className="text-base font-semibold">{nama}</h2>
      <p className="mt-2 inline-block rounded-full bg-[#e3ecdf] px-2.5 py-0.5 text-sm text-hijau">
        {toko}
      </p>
      <p className="mt-2.5 font-semibold text-hijau">
        Rp{harga.toLocaleString("id-ID")}
      </p>
    </article>
  );
}