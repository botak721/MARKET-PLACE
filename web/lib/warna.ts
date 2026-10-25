export const PALET = [
  { bg: "#e3ecdf", teks: "#1f4d3a" },
  { bg: "#f1e0c5", teks: "#7a5a12" },
  { bg: "#dce6f2", teks: "#25496b" },
  { bg: "#f1d9d6", teks: "#8a2f26" },
  { bg: "#e8dff0", teks: "#5a3d73" },
  { bg: "#d9cdb8", teks: "#5c4a2e" },
];

export function warnaDari(nama: string) {
  let h = 0;
  for (const c of nama) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALET[h % PALET.length];
}