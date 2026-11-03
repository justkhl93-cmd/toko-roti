"use client";

import { useEffect, useState } from "react";

const kosong = { username: "", nama: "", password: "" };

export default function PetugasPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(kosong);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/petugas");
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

    const res = await fetch("/api/petugas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }
    setForm(kosong);
    load();
  }

  async function hapus(p) {
    if (!confirm(`Hapus petugas ${p.nama}?`)) return;
    await fetch(`/api/petugas/${p.id}`, { method: "DELETE" });
    load();
  }

  const input = "border rounded-lg p-2 bg-white";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Data Petugas</h1>

      <form onSubmit={simpan} className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-3">Registrasi Petugas Baru</h2>

        {error && (
          <p className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input name="nama" placeholder="Nama lengkap" value={form.nama}
            onChange={ubah} required className={input} />
          <input name="username" placeholder="Username" value={form.username}
            onChange={ubah} required className={input} />
          <input name="password" type="password" placeholder="Password"
            value={form.password} onChange={ubah} required className={input} />
        </div>

        <button type="submit"
          className="mt-3 bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg">
          Daftarkan
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-amber-100">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Username</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.nama}</td>
                <td className="p-3">{p.username}</td>
                <td className="p-3">
                  <button onClick={() => hapus(p)} className="text-red-600 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  Belum ada petugas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}