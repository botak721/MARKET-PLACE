import { Star } from "lucide-react";

export default function Bintang({
  nilai,
  ukuran = "h-4 w-4",
}: {
  nilai: number;
  ukuran?: string;
}) {
  const bulat = Math.round(nilai);
  return (
    <span
      role="img"
      aria-label={`Rating ${nilai.toFixed(1).replace(".", ",")} dari 5`}
      className="inline-flex gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={`${ukuran} ${n <= bulat ? "fill-biru text-biru" : "text-slate-300"}`}
        />
      ))}
    </span>
  );
}
