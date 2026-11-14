// Mengganti nama warna lama (hijau, krem, kartu, kunyit) dengan nama warna baru.
// Jalankan dari folder web:
//   node scripts/rapikan-warna.mjs           (hanya melapor, tidak mengubah apa pun)
//   node scripts/rapikan-warna.mjs --tulis   (menulis perubahan)
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const TULIS = process.argv.includes("--tulis");
const FOLDER = ["app", "components", "lib"];

const POLA =
  /\b(bg|text|border|ring|fill|stroke|divide|outline|accent|decoration|caret|from|via|to)-(hijau|krem|kartu|kunyit)(?![\w-])/g;

function ganti(_, prefix, nama) {
  if (nama === "hijau" || nama === "kunyit") return `${prefix}-biru`;
  if (nama === "kartu") return `${prefix}-white`;
  return prefix === "bg" ? "bg-kanvas" : `${prefix}-white`;
}

const SISA_KELAS = [/\b(hijau|krem|kunyit)\b/, /(?<!shadow)-kartu(?![\w-])/];
const HEKS_LAMA = [
  "#e3ecdf", "#d9cdb8", "#d99a1e", "#f3e6c4", "#7a5a12",
  "#25496b", "#8a2f26", "#5a3d73", "#1f4d3a", "#f6f0e6", "#fffdf8",
];

async function berkas(dir) {
  const hasil = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) hasil.push(...(await berkas(p)));
    else if (/\.(ts|tsx)$/.test(e.name)) hasil.push(p);
  }
  return hasil;
}

const semua = [];
for (const f of FOLDER) {
  try {
    semua.push(...(await berkas(f)));
  } catch {
    console.error(`Folder ${f} tidak ditemukan. Jalankan dari folder web.`);
    process.exit(1);
  }
}

let totalGanti = 0;
const sisaKelas = [];
const sisaHeks = [];

for (const file of semua) {
  const asli = await readFile(file, "utf8");
  let jumlah = 0;
  const baru = asli.replace(POLA, (...a) => {
    jumlah++;
    return ganti(...a);
  });
  if (jumlah > 0) {
    totalGanti += jumlah;
    console.log(`${TULIS ? "Diubah" : "Akan diubah"}: ${file} (${jumlah})`);
    if (TULIS) await writeFile(file, baru, "utf8");
  }
  baru.split("\n").forEach((baris, i) => {
    if (SISA_KELAS.some((r) => r.test(baris))) {
      sisaKelas.push(`${file}:${i + 1}: ${baris.trim()}`);
    }
    if (HEKS_LAMA.some((h) => baris.toLowerCase().includes(h))) {
      sisaHeks.push(`${file}:${i + 1}: ${baris.trim()}`);
    }
  });
}

console.log(`\nTotal penggantian: ${totalGanti}`);

if (sisaKelas.length > 0) {
  console.log("\nMasih memakai nama warna lama (perlu dicek manual):");
  sisaKelas.forEach((s) => console.log("  " + s));
}
if (sisaHeks.length > 0) {
  console.log("\nMasih memakai warna hijau/krem/emas lama (hanya informasi):");
  sisaHeks.forEach((s) => console.log("  " + s));
}

if (!TULIS) {
  console.log("\nIni baru laporan. Tambahkan --tulis untuk menerapkan.");
  process.exit(0);
}

if (sisaKelas.length > 0) {
  console.log("\nglobals.css belum disentuh karena masih ada sisa nama lama.");
  process.exit(0);
}

const cssPath = path.join("app", "globals.css");
let css = await readFile(cssPath, "utf8");
const semula = css;
css = css
  .replace(/\n?[ \t]*\/\* Nama lama[\s\S]*?\*\/\n/, "\n")
  .replace(/[ \t]*--color-(krem|hijau|kartu|kunyit):[^;]+;\n/g, "")
  .replace("@theme {\n", "@theme {\n  --color-kanvas: #f8fafc;\n")
  .replace("var(--color-krem)", "var(--color-kanvas)");

if (css.includes("--color-krem") || css.includes("--color-hijau")) {
  console.log("globals.css berbeda dari yang diharapkan, tidak diubah. Hapus manual.");
} else if (css === semula) {
  console.log("globals.css tidak berubah.");
} else {
  await writeFile(cssPath, css, "utf8");
  console.log("globals.css dibersihkan: alias lama dihapus, kanvas ditambahkan.");
}
