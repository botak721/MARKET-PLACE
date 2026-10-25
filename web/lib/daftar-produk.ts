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