import Link from "next/link";
import { Star } from "lucide-react";
import TombolKeranjang from "@/components/TombolKeranjang";
import { warnaDari } from "@/lib/warna";

type Props = {
  id?: number;
  nama: string;
  toko: string;
  harga: number;
  slug?: string;
  gambar?: string | null;
  rata?: number;
  jumlahUlasan?: number;
  stok?: number;
  lencana?: string;
};

const pil =
  "mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 text-xs font-semibold";

export default function ProductCard({
  id,
  nama,
  toko,
  harga,
  slug,
  gambar,
  rata,
  jumlahUlasan,
  stok,
  lencana,
}: Props) {
  const warna = warnaDari(toko);
  const hurufToko = (Array.from(toko.trim())[0] ?? "?").toUpperCase();
  const hurufProduk = (Array.from(nama.trim())[0] ?? "?").toUpperCase();
  const habis = stok === 0;
  const menipis = stok !== undefined && stok > 0 && stok <= 5;

  const foto = (
    <div className="relative mb-3.5 aspect-square overflow-hidden rounded-xl bg-slate-100">
      {gambar ? (
        <img
          src={gambar}
          alt={nama}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${habis ? "opacity-60" : ""}`}
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center"
          style={{ backgroundColor: warna.bg, color: warna.teks }}
        >
          <span className="font-judul text-6xl font-bold opacity-80">
            {hurufProduk}
          </span>
        </div>
      )}
      {habis ? (
        <span className="absolute top-2.5 left-2.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
          Stok habis
        </span>
      ) : menipis ? (
        <span className="absolute top-2.5 left-2.5 rounded-full bg-navy px-2.5 py-1 text-xs font-bold text-white">
          Sisa {stok}
        </span>
      ) : lencana ? (
        <span className="absolute top-2.5 left-2.5 rounded-full bg-biru px-2.5 py-1 text-xs font-bold text-white">
          {lencana}
        </span>
      ) : null}
    </div>
  );

  const isiPil = (
    <>
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-biru text-[11px] font-bold text-white"
      >
        {hurufToko}
      </span>
      <span className="truncate">{toko}</span>
    </>
  );
  const gayaPil = { backgroundColor: warna.bg, color: warna.teks };

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-kartu transition-all duration-300 hover:-translate-y-1 hover:shadow-kartu-naik motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-4">
      <div>
        {id !== undefined ? (
          <Link href={`/produk/${id}`} className="block">
            {foto}
          </Link>
        ) : (
          foto
        )}
        {slug ? (
          <Link href={`/toko/${slug}`} className={pil} style={gayaPil}>
            {isiPil}
          </Link>
        ) : (
          <p className={pil} style={gayaPil}>
            {isiPil}
          </p>
        )}
        <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold sm:min-h-12 sm:text-base">
          {id !== undefined ? (
            <Link href={`/produk/${id}`} className="hover:underline">
              {nama}
            </Link>
          ) : (
            nama
          )}
        </h3>
        <div className="mt-1.5 flex min-h-5 items-center gap-1.5 text-xs text-slate-600">
          {jumlahUlasan ? (
            <>
              <Star
                className="h-4 w-4 fill-biru text-biru"
                aria-hidden="true"
              />
              <span className="font-bold text-tinta">
                {(rata ?? 0).toLocaleString("id-ID", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
              <span>({jumlahUlasan} ulasan)</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs text-slate-600">Harga</p>
          <p className="font-judul text-base font-bold tabular-nums sm:text-lg">
            Rp{harga.toLocaleString("id-ID")}
          </p>
        </div>
        {id !== undefined && (
          <TombolKeranjang productId={id} nama={nama} stok={stok} />
        )}
      </div>
    </article>
  );
}
