// Enam warna dingin untuk identitas toko. Satu toko selalu mendapat warna yang sama.
export const PALET = [
  { bg: "#e0f2fe", teks: "#075985" },
  { bg: "#bae6fd", teks: "#0c4a6e" },
  { bg: "#e0e7ff", teks: "#3730a3" },
  { bg: "#dbeafe", teks: "#1e40af" },
  { bg: "#cbd5e1", teks: "#0f172a" },
  { bg: "#c7d2fe", teks: "#312e81" },
];

export function warnaDari(nama: string) {
  let h = 0;
  for (const c of nama) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALET[h % PALET.length];
}
