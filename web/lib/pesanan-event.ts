export const EVENT_PESANAN = "pesanan-berubah";

// Dipanggil dari komponen klien setiap kali status pesanan berubah,
// supaya angka badge di ikon Pesanan pada header ikut diperbarui.
export function kabarPesanan() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_PESANAN));
  }
}
