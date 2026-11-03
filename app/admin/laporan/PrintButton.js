"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-green-100 hover:bg-green-200 text-emerald-900 px-4 py-2 rounded-xl"
    >
      Cetak / Simpan PDF
    </button>
  );
}