"use client";

import { useEffect, useState } from "react";
import { Camera, Package } from "lucide-react";

const kosong = { kode: "", nama: "", harga: "", stok: "" };
const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export default function ProdukPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(kosong);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/barang");
    setList(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function ubah(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function simpan(e) {
    e.preventDefault();
    setError("");

    const res = await fetch(editing ? `/api/barang/${form.kode}` : "/api/barang", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }
    setForm(kosong);
    setEditing(false);
    load();
  }

  function edit(b) {
    setForm({ kode: b.kode, nama: b.nama, harga: b.harga, stok: b.stok });
    setEditing(true);
    window.scrollTo(0, 0);
  }

  function batal() {
    setForm(kosong);
    setEditing(false);
    setError("");
  }

  async function hapus(b) {
    if (!confirm(`Hapus ${b.nama}?`)) return;
    await fetch(`/api/barang/${b.kode}`, { method: "DELETE" });
    load();
  }

  async function uploadFoto(kode, file) {
    if (!file) return;
    setError("");

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/barang/${kode}/gambar`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }
    load();
  }

  const input = "border rounded-lg p-2 bg-white";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Data Produk</h1>

      {error && (
        <p className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</p>
      )}

      <form onSubmit={simpan} className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-3">
          {editing ? "Edit Produk" : "Tambah Produk"}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input name="kode" placeholder="Kode produk" value={form.kode}
            onChange={ubah} disabled={editing} required className={input} />
          <input name="nama" placeholder="Nama produk" value={form.nama}
            onChange={ubah} required className={input} />
          <input name="harga" type="number" min="0" placeholder="Harga"
            value={form.harga} onChange={ubah} required className={input} />
          <input name="stok" type="number" min="0" placeholder="Stok"
            value={form.stok} onChange={ubah} required className={input} />
        </div>

        <div className="mt-3 flex gap-2">
          <button type="submit"
            className="bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg">
            {editing ? "Simpan Perubahan" : "Tambah"}
          </button>
          {editing && (
            <button type="button" onClick={batal}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">
              Batal
            </button>
          )}
        </div>
        {!editing && (
          <p className="text-sm text-gray-500 mt-3">
            Foto produk ditambahkan setelah produk tersimpan, lewat tombol Foto di tabel.
          </p>
        )}
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3">Foto</th>
              <th className="p-3">Kode</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Stok</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.kode} className="border-t">
                <td className="p-3">
                  {b.gambar ? (
                    <img src={b.gambar} alt={b.nama}
                      className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-emerald-400">
                      <Package size={20} />
                    </div>
                  )}
                </td>
                <td className="p-3">{b.kode}</td>
                <td className="p-3">{b.nama}</td>
                <td className="p-3">{rupiah(b.harga)}</td>
                <td className={"p-3 " + (b.stok <= 10 ? "text-red-600 font-semibold" : "")}>
                  {b.stok}
                </td>
                <td className="p-3 space-x-3">
                  <label className="inline-flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer">
                    <Camera size={14} />
                    Foto
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        uploadFoto(b.kode, e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button onClick={() => edit(b)} className="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => hapus(b)} className="text-red-600 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Belum ada produk
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}