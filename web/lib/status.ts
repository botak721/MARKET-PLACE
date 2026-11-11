export const STATUS: Record<string, { label: string; kelas: string }> = {
  MENUNGGU_BAYAR: {
    label: "Menunggu pembayaran",
    kelas: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  },
  MENUNGGU: {
    label: "Menunggu diproses",
    kelas: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  },
  DIPROSES: {
    label: "Sedang dikemas",
    kelas: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200",
  },
  DIKIRIM: {
    label: "Dalam pengiriman",
    kelas: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  },
  SELESAI: {
    label: "Selesai",
    kelas: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  },
  DIBATALKAN: {
    label: "Dibatalkan",
    kelas: "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
};

export function infoStatus(status: string) {
  return (
    STATUS[status] ?? {
      label: status,
      kelas: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    }
  );
}
