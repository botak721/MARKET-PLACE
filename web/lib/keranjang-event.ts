export const EVENT_KERANJANG = "keranjang-berubah";

// Dipanggil dari komponen klien setiap kali isi keranjang berubah,
// supaya angka di ikon keranjang pada header ikut diperbarui.
export function kabarKeranjang() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_KERANJANG));
  }
}
