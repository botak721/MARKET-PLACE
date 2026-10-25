"use client";

import { useRouter } from "next/navigation";
import { URUTAN, buatUrl, type KodeUrutan } from "@/lib/daftar-produk";

export default function PilihUrutan({
  aktif,
  dasar,
  param,
  hash,
}: {
  aktif: KodeUrutan;
  dasar: string;
  param: Record<string, string | undefined>;
  hash?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="urut" className="text-sm font-semibold">
        Urutkan
      </label>
      <select
        id="urut"
        key={aktif}
        defaultValue={aktif}
        onChange={(e) =>
          router.push(
            buatUrl(
              dasar,
              { ...param, urut: e.target.value === "terbaru" ? undefined : e.target.value },
              hash,
            ),
          )
        }
        className="min-h-11 rounded-full border-2 border-hijau bg-transparent px-4 text-sm"
      >
        {URUTAN.map((u) => (
          <option key={u.kode} value={u.kode}>
            {u.nama}
          </option>
        ))}
      </select>
    </div>
  );
}