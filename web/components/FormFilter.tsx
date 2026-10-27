import Link from "next/link";
import { KATEGORI } from "@/lib/kategori";
import type { NilaiFilter } from "@/lib/daftar-produk";

export default function FormFilter({
  prefix,
  aksi,
  f,
  jumlahKategori,
  tersembunyi,
  hapusHref,
}: {
  prefix: string;
  aksi: string;
  f: NilaiFilter;
  jumlahKategori: Record<string, number>;
  tersembunyi: Record<string, string | undefined>;
  hapusHref: string;
}) {
  const id = (n: string) => `${prefix}-${n}`;
  const judul = "mb-1 text-sm font-semibold";
  const pilihan = "flex min-h-11 items-center gap-3 text-sm";
  const kotak = "h-5 w-5 shrink-0 accent-hijau";
  const kolom =
    "w-full rounded-full border-2 border-hijau bg-transparent px-4 py-2";

  return (
    <form action={aksi} method="get" className="space-y-5">
      {Object.entries(tersembunyi).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}

      <fieldset>
        <legend className={judul}>Kategori</legend>
        {KATEGORI.map((k) => {
          const n = jumlahKategori[k.slug] ?? 0;
          const dipilih = f.kategori.includes(k.slug);
          return (
            <label
              key={k.slug}
              className={`${pilihan} ${n === 0 && !dipilih ? "opacity-70" : ""}`}
            >
              <input
                type="checkbox"
                name="kategori"
                value={k.slug}
                defaultChecked={dipilih}
                className={kotak}
              />
              <span>{k.nama}</span>
              <span className="ml-auto text-xs opacity-70">{n}</span>
            </label>
          );
        })}
      </fieldset>

      <fieldset>
        <legend className={judul}>Harga (rupiah)</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={id("min")} className="mb-1 block text-xs">
              Terendah
            </label>
            <input
              id={id("min")}
              name="min"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={f.min}
              placeholder="0"
              className={kolom}
            />
          </div>
          <div>
            <label htmlFor={id("maks")} className="mb-1 block text-xs">
              Tertinggi
            </label>
            <input
              id={id("maks")}
              name="maks"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={f.maks}
              placeholder="Bebas"
              className={kolom}
            />
          </div>
        </div>
      </fieldset>

      <label className={pilihan}>
        <input
          type="checkbox"
          name="tersedia"
          value="1"
          defaultChecked={f.tersedia}
          className={kotak}
        />
        Hanya yang tersedia
      </label>

      <fieldset>
        <legend className={judul}>Rating</legend>
        {[
          { v: "", t: "Semua rating" },
          { v: "4", t: "★ 4 ke atas" },
          { v: "3", t: "★ 3 ke atas" },
        ].map((o) => (
          <label key={o.v} className={pilihan}>
            <input
              type="radio"
              name="rating"
              value={o.v}
              defaultChecked={String(f.rating || "") === o.v}
              className={kotak}
            />
            {o.t}
          </label>
        ))}
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          className="min-h-11 flex-1 rounded-full bg-hijau px-5 font-semibold text-krem"
        >
          Terapkan
        </button>
        <Link
          href={hapusHref}
          className="inline-flex min-h-11 items-center rounded-full border-2 border-hijau px-5 font-semibold text-hijau"
        >
          Atur ulang
        </Link>
      </div>
    </form>
  );
}