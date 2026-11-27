"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { EVENT_TOAST, type ToastPayload, type ToastType } from "@/lib/toast-event";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface ToastItem {
  id: string;
  pesan: string;
  tipe: ToastType;
  /** true = sedang keluar layar */
  keluar: boolean;
}

interface ToastContextValue {
  tambah: (pesan: string, tipe?: ToastType) => void;
}

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Provider                                                             */
/* ------------------------------------------------------------------ */

const DURASI_MS = 3000;
const ANIMASI_MS = 300;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [daftar, setDaftar] = useState<ToastItem[]>([]);
  const baseId = useId();
  const counter = useRef(0);

  const hapus = useCallback((id: string) => {
    // Tandai keluar dulu (animasi slide-out), baru hapus dari DOM
    setDaftar((prev) =>
      prev.map((t) => (t.id === id ? { ...t, keluar: true } : t)),
    );
    setTimeout(() => {
      setDaftar((prev) => prev.filter((t) => t.id !== id));
    }, ANIMASI_MS);
  }, []);

  const tambah = useCallback(
    (pesan: string, tipe: ToastType = "info") => {
      const id = `${baseId}-${++counter.current}`;
      setDaftar((prev) => [...prev, { id, pesan, tipe, keluar: false }]);
      setTimeout(() => hapus(id), DURASI_MS);
    },
    [baseId, hapus],
  );

  /* Dengarkan event global agar bisa dipanggil dari mana saja */
  useEffect(() => {
    function onEvent(e: Event) {
      const { pesan, tipe } = (e as CustomEvent<ToastPayload>).detail;
      tambah(pesan, tipe ?? "info");
    }
    window.addEventListener(EVENT_TOAST, onEvent);
    return () => window.removeEventListener(EVENT_TOAST, onEvent);
  }, [tambah]);

  return (
    <ToastContext.Provider value={{ tambah }}>
      {children}
      <ToastDisplay daftar={daftar} onHapus={hapus} />
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Display                                                             */
/* ------------------------------------------------------------------ */

const konfigurasi: Record<
  ToastType,
  { bg: string; ikon: React.ReactNode; label: string }
> = {
  success: {
    bg: "bg-emerald-500",
    ikon: <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />,
    label: "Berhasil",
  },
  error: {
    bg: "bg-red-500",
    ikon: <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />,
    label: "Error",
  },
  info: {
    bg: "bg-biru",
    ikon: <Info className="h-5 w-5 shrink-0" aria-hidden="true" />,
    label: "Info",
  },
};

function ToastDisplay({
  daftar,
  onHapus,
}: {
  daftar: ToastItem[];
  onHapus: (id: string) => void;
}) {
  if (daftar.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifikasi"
      className="fixed right-4 bottom-20 z-[9999] flex flex-col gap-3 md:bottom-6"
    >
      {daftar.map((toast) => {
        const { bg, ikon, label } = konfigurasi[toast.tipe];
        return (
          <div
            key={toast.id}
            role="status"
            aria-label={`${label}: ${toast.pesan}`}
            className={[
              "flex min-w-[16rem] max-w-xs items-start gap-3 rounded-2xl px-4 py-3",
              "text-sm font-semibold text-white shadow-kartu-naik",
              bg,
              "transition-all duration-300 ease-out motion-reduce:transition-none",
              toast.keluar
                ? "translate-y-4 opacity-0"
                : "translate-y-0 opacity-100",
            ].join(" ")}
          >
            {ikon}
            <span className="flex-1 leading-snug">{toast.pesan}</span>
            <button
              type="button"
              onClick={() => onHapus(toast.id)}
              aria-label="Tutup notifikasi"
              className="mt-0.5 shrink-0 rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
