import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const FOLDER = "foto-produk";
const BATAS = 5 * 1024 * 1024;
const TIPE = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN tidak terbaca. Jalankan dengan --env-file=.env.local");
  process.exit(1);
}

const berkas = (await readdir(FOLDER))
  .filter((f) => /^\d+\.(jpe?g|png|webp)$/i.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));

if (berkas.length === 0) {
  console.error(`Tidak ada file bernama id.jpg di folder ${FOLDER}.`);
  process.exit(1);
}

const sql = [];
for (const nama of berkas) {
  const id = parseInt(nama);
  const ext = path.extname(nama).toLowerCase();
  const { size } = await stat(path.join(FOLDER, nama));
  if (size > BATAS) {
    console.log(`Lewati ${nama}: ${(size / 1048576).toFixed(1)} MB, melebihi 5 MB`);
    continue;
  }
  const isi = await readFile(path.join(FOLDER, nama));
  const hasil = await put(`produk/seed-${id}${ext}`, isi, {
    access: "public",
    addRandomSuffix: true,
    contentType: TIPE[ext],
  });
  console.log(`Terunggah ${nama}`);
  sql.push(`UPDATE "Product" SET gambar = '${hasil.url}' WHERE id = ${id} AND gambar IS NULL;`);
}

console.log("\nSalin semua baris di bawah ini ke SQL Editor Neon:\n");
console.log(sql.join("\n"));