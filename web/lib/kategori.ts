export const KATEGORI = [
  { slug: "fashion", nama: "Fashion" },
  { slug: "makanan-minuman", nama: "Makanan dan minuman" },
  { slug: "rumah-tangga", nama: "Rumah tangga" },
  { slug: "kerajinan", nama: "Kerajinan" },
  { slug: "kecantikan", nama: "Kecantikan" },
  { slug: "elektronik", nama: "Elektronik" },
  { slug: "lainnya", nama: "Lainnya" },
];

export function adaKategori(slug?: string | null): slug is string {
  return !!slug && KATEGORI.some((k) => k.slug === slug);
}

export function namaKategori(slug?: string | null) {
  return KATEGORI.find((k) => k.slug === slug)?.nama ?? null;
}