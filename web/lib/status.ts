export const STATUS: Record<string, { label: string; kelas: string }> = {
  MENUNGGU: { label: "Menunggu diproses", kelas: "bg-[#f3e6c4] text-[#7a5a12]" },
  DIPROSES: { label: "Sedang dikemas", kelas: "bg-[#dce6f2] text-[#25496b]" },
  DIKIRIM: { label: "Dalam pengiriman", kelas: "bg-[#e3ecdf] text-hijau" },
  SELESAI: { label: "Selesai", kelas: "bg-hijau text-krem" },
  DIBATALKAN: { label: "Dibatalkan", kelas: "bg-[#f1d9d6] text-[#8a2f26]" },
};

export function infoStatus(status: string) {
  return STATUS[status] ?? { label: status, kelas: "bg-[#e3ecdf] text-hijau" };
}