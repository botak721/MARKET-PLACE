export type ToastType = "success" | "error" | "info";

export interface ToastPayload {
  pesan: string;
  tipe?: ToastType;
}

export const EVENT_TOAST = "tampilkan-toast";

/**
 * Panggil dari mana saja (client component / server action hasil) untuk
 * memunculkan toast tanpa prop drilling.
 */
export function tampilkanToast(pesan: string, tipe: ToastType = "info") {
  if (typeof window === "undefined") return;
  const payload: ToastPayload = { pesan, tipe };
  window.dispatchEvent(
    new CustomEvent<ToastPayload>(EVENT_TOAST, { detail: payload }),
  );
}
