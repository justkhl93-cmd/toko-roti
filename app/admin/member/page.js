"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Users, UserPlus } from "lucide-react";

const kosong = { nama: "", no_hp: "" };

export default function MemberPage() {
  const [list, setList] = useState([]);
  const [cari, setCari] = useState("");
  const [form, setForm] = useState(kosong);
  const [editId, setEditId] = useState(null);
  const [tampilForm, setTampilForm] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/member");
    const data = await res.json();
    setList(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  function bukaTambah() {
    setForm(kosong);
    setEditId(null);
    setError("");
    setTampilForm(true);
  }

  function bukaEdit(m) {
    setForm({ nama: m.nama, no_hp: m.no_hp });
    setEditId(m.id);
    setError("");
    setTampilForm(true);
    window.scrollTo(0, 0);
  }

  function tutupForm() {
    setTampilForm(false);
    setEditId(null);
    setForm(kosong);
    setError("");
  }

  function ubah(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function simpan(e) {
    e.preventDefault();
    setError("");

    const res = await fetch(editId ? `/api/member/${editId}` : "/api/member", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }
    tutupForm();
    load();
  }

  async function hapus(m) {
    if (!confirm(`Hapus member ${m.nama}?`)) return;
    await fetch(`/api/member/${m.id}`, { method: "DELETE" });
    load();
  }

  const sekarang = new Date();
  const baru = list.filter((m) => {
    const d = new Date(m.dibuat);
    return (
      d.getMonth() === sekarang.getMonth() &&
      d.getFullYear() === sekarang.getFullYear()
    );
  }).length;

  const hasil = list.filter((m) =>
    `${m.nama} ${m.kode} ${m.no_hp}`.toLowerCase().includes(cari.toLowerCase())
  );

  const input = "border border-green-200 rounded-xl p-2 bg-white";

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-xs tracking-widest text-emerald-700">MEMBER</div>
          <h1 className="text-3xl font-bold text-emerald-900">Daftar Member</h1>
        </div>
        <button
          onClick={bukaTambah}
          className="bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-green-100 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Total Member</div>
            <div className="text-2xl font-bold text-emerald-900">{list.length}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Baru bulan ini</div>
            <div className="text-2xl font-bold text-emerald-900">{baru}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UserPlus size={20} />
          </div>
        </div>
      </div>

      {tampilForm && (
        <form
          onSubmit={simpan}
          className="bg-white p-4 rounded-2xl border border-green-100 mb-6"
        >
          <h2 className="font-semibold mb-3">
            {editId ? "Edit Member" : "Tambah Member"}
          </h2>

          {error && (
            <p className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="nama" placeholder="Nama member" value={form.nama}
              onChange={ubah} required className={input} />
            <input name="no_hp" placeholder="Nomor HP" value={form.no_hp}
              onChange={ubah} required className={input} />
          </div>

          <div className="mt-3 flex gap-2">
            <button type="submit"
              className="bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl">
              Simpan
            </button>
            <button type="button" onClick={tutupForm}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl">
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-green-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama, kode, atau nomor HP"
            className="w-full border border-green-200 rounded-xl py-2 pl-10 pr-3"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Kode Member</th>
              <th className="p-3">Nomor HP</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {hasil.map((m) => (
              <tr key={m.id} className="border-t border-green-100">
                <td className="p-3">{m.nama}</td>
                <td className="p-3">{m.kode}</td>
                <td className="p-3">{m.no_hp}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => bukaEdit(m)}
                      className="w-9 h-9 rounded-lg border border-green-200 text-emerald-700 hover:bg-green-100 flex items-center justify-center"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => hapus(m)}
                      className="w-9 h-9 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {hasil.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  Belum ada member
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}