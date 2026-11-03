"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-white py-2 rounded-lg"
    >
      Cetak Struk
    </button>
  );
}