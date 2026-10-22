"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card p-6">
      <h2 className="font-bold text-red-700">Terjadi kesalahan</h2>
      <p className="mt-2 text-sm text-muted">{error.message || "Gagal memuat data. Periksa koneksi database / environment variables."}</p>
      <button className="btn-ghost mt-4" onClick={reset}>Coba lagi</button>
    </div>
  );
}
