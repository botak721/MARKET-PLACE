import { adaKategori } from "@/lib/kategori";
export const PER_HALAMAN = 12;

export const URUTAN = [
  { kode: "terbaru", nama: "Terbaru" },
  { kode: "termurah", nama: "Harga terendah" },
  { kode: "termahal", nama: "Harga tertinggi" },
  { kode: "diulas", nama: "Paling banyak diulas" },
] as const;

export type KodeUrutan = (typeof URUTAN)[number]["kode"];

type Arah = "asc" | "desc";
type Urut = { id?: Arah; harga?: Arah; reviews?: { _count: Arah } };

export function bacaUrutan(nilai?: string): KodeUrutan {
  const cocok = URUTAN.find((u) => u.kode === nilai);
  return cocok ? cocok.kode : "terbaru";
}

export function bacaHalaman(nilai?: string) {
  const n = Number(nilai);
  return Number.isInteger(n) && n >= 1 && n <= 10000 ? n : 1;
}

export function aturUrutan(kode: KodeUrutan): Urut[] {
  switch (kode) {
    case "termurah":
      return [{ harga: "asc" }, { id: "desc" }];
    case "termahal":
      return [{ harga: "desc" }, { id: "desc" }];
    case "diulas":
      return [{ reviews: { _count: "desc" } }, { id: "desc" }];
    default:
      return [{ id: "desc" }];
  }
}

export function buatUrl(
  dasar: string,
  param: Record<string, string | undefined>,
  hash = "",
) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(param)) {
    if (v) qs.set(k, v);
  }
  const s = qs.toString();
  return `${dasar}${s ? `?${s}` : ""}${hash}`;
}
export type ParamMentah = Record<string, string | string[] | undefined>;

export function satu(nilai?: string | string[]) {
  return Array.isArray(nilai) ? nilai[0] : nilai;
}

export type NilaiFilter = {
  kategori: string[];
  min?: number;
  maks?: number;
  tersedia: boolean;
  rating: 0 | 3 | 4;
};

function bacaAngka(nilai?: string) {
  if (!nilai) return undefined;
  const n = Number(nilai);
  return Number.isInteger(n) && n >= 0 && n <= 2_000_000_000 ? n : undefined;
}

export function bacaFilter(p: ParamMentah): NilaiFilter {
  const mentah = Array.isArray(p.kategori)
    ? p.kategori.join(",")
    : (p.kategori ?? "");
  const kategori = [
    ...new Set(
      mentah
        .split(",")
        .map((k) => k.trim())
        .filter((k) => adaKategori(k)),
    ),
  ];

  let min = bacaAngka(satu(p.min));
  let maks = bacaAngka(satu(p.maks));
  if (min !== undefined && maks !== undefined && min > maks) {
    [min, maks] = [maks, min];
  }

  const r = satu(p.rating);
  return {
    kategori,
    min,
    maks,
    tersedia: satu(p.tersedia) === "1",
    rating: r === "4" ? 4 : r === "3" ? 3 : 0,
  };
}

export function paramFilter(f: NilaiFilter): Record<string, string | undefined> {
  return {
    kategori: f.kategori.length > 0 ? f.kategori.join(",") : undefined,
    min: f.min !== undefined ? String(f.min) : undefined,
    maks: f.maks !== undefined ? String(f.maks) : undefined,
    tersedia: f.tersedia ? "1" : undefined,
    rating: f.rating > 0 ? String(f.rating) : undefined,
  };
}