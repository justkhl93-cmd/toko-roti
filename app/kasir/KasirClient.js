"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Croissant, LogOut } from "lucide-react";

const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export default function KasirClient({ nama }) {
  const router = useRouter();
  const [produk, setProduk] = useState([]);
  const [cart, setCart] = useState([]);
  const [member, setMember] = useState(false);
  const [phone, setPhone] = useState("");
  const [metode, setMetode] = useState("Tunai");
  const [bayarInput, setBayarInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadProduk() {
    const res = await fetch("/api/barang");
    setProduk(await res.json());
  }

  useEffect(() => {
    loadProduk();
  }, []);

  function tambah(p) {
    setError("");
    const ada = cart.find((c) => c.kode === p.kode);
    const qtySekarang = ada ? ada.qty : 0;

    if (qtySekarang + 1 > p.stok) {
      setError(`Stok ${p.nama} tidak cukup (sisa ${p.stok})`);
      return;
    }

    if (ada) {
      setCart(cart.map((c) => (c.kode === p.kode ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { kode: p.kode, nama: p.nama, harga: p.harga, qty: 1 }]);
    }
  }

  function ubahQty(k, delta) {
    setError("");
    const p = produk.find((x) => x.kode === k);
    setCart(
      cart
        .map((c) => {
          if (c.kode !== k) return c;
          const baru = c.qty + delta;
          if (baru > p.stok) {
            setError(`Stok ${p.nama} tidak cukup (sisa ${p.stok})`);
            return c;
          }
          return { ...c, qty: baru };
        })
        .filter((c) => c.qty > 0)
    );
  }

  const total = cart.reduce((sum, c) => sum + c.harga * c.qty, 0);
  const tunai = metode === "Tunai";
  const diterima = Number(bayarInput) || 0;
  const selisih = diterima - total;
  const bisaBayar = cart.length > 0 && (!tunai || diterima >= total);

  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function bayar() {
    setError("");
    if (cart.length === 0) return setError("Keranjang masih kosong");
    if (member && !phone.trim()) return setError("Isi nomor telepon member");

    setLoading(true);
    const res = await fetch("/api/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((c) => ({ kode: c.kode, qty: c.qty })),
        member_phone: member ? phone.trim() : null,
        metode,
        bayar: tunai ? diterima : total,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      loadProduk();
      return;
    }
    router.push(`/kasir/struk/${data.id}`);
  }

  const kotak = "bg-white rounded-2xl shadow-sm border border-green-100 p-4";

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 text-base">
      <header className="bg-emerald-200 text-emerald-950 px-6 py-3 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold flex items-center gap-2">
            <Croissant size={26} />
            Toko Roti · Kasir
          </div>
          <div className="text-sm text-emerald-800">
            Kasir: {nama} · {tanggal}
          </div>
        </div>
        <form action="/api/logout" method="POST">
          <button className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-5 py-2 rounded-xl flex items-center gap-2">
            <LogOut size={16} />
            Logout
          </button>
        </form>
      </header>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {error && (
            <p className="bg-rose-100 text-rose-800 p-3 rounded-xl">{error}</p>
          )}

          <div className={kotak + " overflow-x-auto"}>
            <h2 className="text-xl font-semibold mb-3">Keranjang</h2>
            <table className="w-full text-left">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-3 rounded-l-lg">Barang</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">Jumlah</th>
                  <th className="p-3 rounded-r-lg">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((c) => (
                  <tr key={c.kode} className="border-t border-green-100">
                    <td className="p-3">{c.nama}</td>
                    <td className="p-3">{rupiah(c.harga)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => ubahQty(c.kode, -1)}
                        className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-lg"
                      >
                        -
                      </button>
                      <span className="mx-4 font-semibold">{c.qty}</span>
                      <button
                        onClick={() => ubahQty(c.kode, 1)}
                        className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-lg"
                      >
                        +
                      </button>
                    </td>
                    <td className="p-3 font-semibold">{rupiah(c.harga * c.qty)}</td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-400">
                      Belum ada barang. Pilih barang di bawah.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={kotak}>
            <h2 className="text-xl font-semibold mb-3">
              Pilih barang (klik tambah)
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {produk.map((p) => (
                <div
                  key={p.kode}
                  className="border border-green-200 rounded-xl p-3 bg-white flex flex-col"
                >
                  <div className="relative h-32 rounded-lg bg-green-50 overflow-hidden flex items-center justify-center">
                    {p.gambar ? (
                      <img
                        src={p.gambar}
                        alt={p.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Croissant size={40} className="text-emerald-300" />
                    )}
                    {p.stok <= 0 && (
                      <span className="absolute top-2 left-2 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                        Habis
                      </span>
                    )}
                    {p.stok > 0 && p.stok <= 10 && (
                      <span className="absolute top-2 left-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                        Stok menipis
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex justify-between gap-2">
                    <div className="font-semibold leading-tight">{p.nama}</div>
                    <div className="text-emerald-700 font-semibold whitespace-nowrap">
                      {rupiah(p.harga)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{p.kode}</div>

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Stok: {p.stok}</span>
                    <button
                      onClick={() => tambah(p)}
                      disabled={p.stok <= 0}
                      className="bg-emerald-400 hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={kotak + " xl:col-span-2 space-y-5 h-fit"}>
          <div>
            <div className="font-semibold mb-2">Membership</div>
            <label className="mr-6">
              <input type="radio" checked={!member} onChange={() => setMember(false)} />{" "}
              Tidak
            </label>
            <label>
              <input type="radio" checked={member} onChange={() => setMember(true)} />{" "}
              Punya
            </label>
            {member && (
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="No. telepon member"
                className="mt-3 w-full border border-green-200 rounded-xl p-3"
              />
            )}
          </div>

          <div>
            <div className="font-semibold mb-2">Metode pembayaran</div>
            <select
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              className="w-full border border-green-200 rounded-xl p-3 bg-white"
            >
              <option>Tunai</option>
              <option>QRIS</option>
              <option>Debit</option>
            </select>
          </div>

          <div className="border-t border-green-100 pt-4">
            <div className="text-gray-500">Total belanja</div>
            <div className="text-5xl font-bold text-emerald-700">{rupiah(total)}</div>
          </div>

          {tunai ? (
            <div className="space-y-3">
              <div className="font-semibold">Uang diterima</div>
              <input
                type="number"
                min="0"
                value={bayarInput}
                onChange={(e) => setBayarInput(e.target.value)}
                placeholder="Masukkan nominal"
                className="w-full border border-green-200 rounded-xl p-3 text-2xl"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setBayarInput(String(total))}
                  className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg"
                >
                  Uang pas
                </button>
                {[20000, 50000, 100000].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBayarInput(String(n))}
                    className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg"
                  >
                    {rupiah(n)}
                  </button>
                ))}
              </div>

              {total > 0 && (
                <div
                  className={
                    "p-4 rounded-xl text-2xl font-bold " +
                    (selisih < 0
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800")
                  }
                >
                  {selisih < 0
                    ? `Kurang ${rupiah(-selisih)}`
                    : `Kembalian ${rupiah(selisih)}`}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">
              Pembayaran {metode}: nominal pas sesuai total belanja.
            </p>
          )}

          <button
            onClick={bayar}
            disabled={loading || !bisaBayar}
            className="w-full bg-emerald-400 hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xl font-semibold py-4 rounded-xl"
          >
            {loading ? "Memproses..." : "Bayar"}
          </button>
        </div>
      </div>
    </div>
  );
}