export function SkeletonKeranjang() {
  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6"
    >
      <p role="status" className="sr-only">
        Memuat keranjang...
      </p>
      <div className="flex items-end gap-3">
        <div className="h-9 w-56 animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" />
        <div className="h-6 w-32 animate-pulse rounded-full bg-slate-100 motion-reduce:animate-none" />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="space-y-4 lg:col-span-2">
          {[0, 1].map((grup) => (
            <div
              key={grup}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white shadow-kartu motion-reduce:animate-none"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div className="h-4 w-36 rounded-full bg-slate-200" />
              </div>
              <div className="divide-y divide-slate-100">
                {[0, 1].map((item) => (
                  <div key={item} className="flex gap-4 px-5 py-4">
                    <div className="h-20 w-20 shrink-0 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 w-3/4 rounded-full bg-slate-200" />
                      <div className="h-4 w-1/3 rounded-full bg-slate-100" />
                      <div className="h-8 w-28 rounded-full bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-kartu motion-reduce:animate-none">
          <div className="h-6 w-40 rounded-full bg-slate-200" />
          <div className="mt-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-28 rounded-full bg-slate-100" />
              <div className="h-4 w-20 rounded-full bg-slate-200" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-24 rounded-full bg-slate-100" />
              <div className="h-4 w-24 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="h-3 w-20 rounded-full bg-slate-100" />
            <div className="mt-2 h-8 w-36 rounded-xl bg-slate-200" />
          </div>
          <div className="mt-5 h-12 w-full rounded-full bg-slate-200" />
        </div>
      </div>
    </main>
  );
}

export function SkeletonPesanan() {
  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6"
    >
      <p role="status" className="sr-only">
        Memuat pesanan...
      </p>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-9 w-44 animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" />
          <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100 motion-reduce:animate-none" />
        </div>
        <div className="h-20 w-48 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-kartu motion-reduce:animate-none" />
      </div>

      <div className="mt-6 flex gap-2 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-slate-200 motion-reduce:animate-none"
          />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {[0, 1].map((kartu) => (
          <div
            key={kartu}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white shadow-kartu motion-reduce:animate-none"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded-full bg-slate-200" />
                  <div className="h-3 w-24 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="h-6 w-28 rounded-full bg-slate-200" />
            </div>
            <div className="px-5 py-4">
              <div className="h-10 w-full rounded-xl bg-slate-100" />
            </div>
            <div className="flex items-center gap-4 border-t border-slate-100 px-5 py-4">
              <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded-full bg-slate-200" />
                <div className="h-3 w-1/3 rounded-full bg-slate-100" />
              </div>
              <div className="h-5 w-24 rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export function SkeletonDashboard() {
  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-6"
    >
      <p role="status" className="sr-only">
        Memuat dashboard...
      </p>
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-kartu motion-reduce:animate-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-6 w-44 rounded-xl bg-slate-200" />
              <div className="h-4 w-56 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-11 w-32 rounded-full bg-slate-200" />
            <div className="h-11 w-28 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-kartu motion-reduce:animate-none"
          >
            <div className="h-3 w-24 rounded-full bg-slate-100" />
            <div className="mt-3 h-7 w-32 rounded-xl bg-slate-200" />
            <div className="mt-2 h-3 w-20 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-kartu motion-reduce:animate-none" />
    </main>
  );
}
