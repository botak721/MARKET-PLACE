"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

const kolom =
  "h-12 w-full rounded-2xl border-[1.5px] border-slate-300 bg-white pr-4 pl-11 text-sm outline-none focus:border-biru focus:ring-4 focus:ring-biru/15";

export function KartuAuth({
  aktif,
  judul,
  subjudul,
  children,
}: {
  aktif: "masuk" | "daftar";
  judul: string;
  subjudul: string;
  children: React.ReactNode;
}) {
  const tab =
    "flex min-h-11 items-center justify-center rounded-full text-sm font-semibold transition-colors";
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-kartu sm:p-8">
      <h1 className="font-judul text-center text-2xl font-bold sm:text-3xl">
        {judul}
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">{subjudul}</p>
      <nav
        aria-label="Masuk atau daftar"
        className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1"
      >
        <Link
          href="/sign-in"
          aria-current={aktif === "masuk" ? "page" : undefined}
          className={`${tab} ${aktif === "masuk" ? "bg-biru text-white shadow" : "text-slate-700 hover:text-tinta"}`}
        >
          Masuk
        </Link>
        <Link
          href="/sign-up"
          aria-current={aktif === "daftar" ? "page" : undefined}
          className={`${tab} ${aktif === "daftar" ? "bg-biru text-white shadow" : "text-slate-700 hover:text-tinta"}`}
        >
          Daftar
        </Link>
      </nav>
      {children}
    </div>
  );
}

export function KolomIsian({
  id,
  name,
  label,
  type = "text",
  ikon,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  ikon: "email" | "nama";
  autoComplete?: string;
}) {
  const Ikon = ikon === "email" ? Mail : User;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">
        {label}
      </label>
      <div className="relative">
        <Ikon
          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          className={kolom}
        />
      </div>
    </div>
  );
}

export function KolomSandi({
  id,
  label,
  autoComplete,
  petunjuk,
  minLength,
}: {
  id: string;
  label: string;
  autoComplete: string;
  petunjuk?: string;
  minLength?: number;
}) {
  const [lihat, setLihat] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          id={id}
          name="password"
          type={lihat ? "text" : "password"}
          autoComplete={autoComplete}
          aria-describedby={petunjuk ? `${id}-petunjuk` : undefined}
          required
          minLength={minLength}
          className={`${kolom} pr-12`}
        />
        <button
          type="button"
          onClick={() => setLihat((v) => !v)}
          aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-pressed={lihat}
          className="absolute top-1/2 right-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
        >
          {lihat ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {petunjuk && (
        <p id={`${id}-petunjuk`} className="mt-1 text-xs text-slate-600">
          {petunjuk}
        </p>
      )}
    </div>
  );
}
