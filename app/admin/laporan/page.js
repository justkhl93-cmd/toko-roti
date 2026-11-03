import pool from "@/lib/db";
import PrintButton from "./PrintButton";

const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export default async function LaporanPage({ searchParams }) {
  const sp = await searchParams;
  const hariIni = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Jakarta",
  });
  const dari = sp.dari || hariIni;
  const sampai = sp.sampai || hariIni;

  const [rows] = await pool.query(
    `SELECT d.kode, d.nama, SUM(d.qty) AS terjual, SUM(d.qty * d.harga) AS pendapatan
     FROM detail d
     JOIN transaksi t ON t.id = d.transaksi_id
     WHERE DATE(t.tanggal) BETWEEN ? AND ?
     GROUP BY d.kode, d.nama
     ORDER BY terjual DESC`,
    [dari, sampai]
  );

  const [[ringkas]] = await pool.query(
    "SELECT COUNT(*) AS jumlah FROM transaksi WHERE DATE(tanggal) BETWEEN ? AND ?",
    [dari, sampai]
  );

  const totalTerjual = rows.reduce((s, r) => s + Number(r.terjual), 0);
  const totalPendapatan = rows.reduce((s, r) => s + Number(r.pendapatan), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-900">Laporan Penjualan</h1>
      <p className="text-gray-500 mb-4">
        Periode {dari} sampai {sampai}
      </p>

      <form className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 mb-6 flex flex-wrap items-end gap-3 print:hidden">
        <div>
          <label className="block text-sm text-gray-500">Dari tanggal</label>
          <input type="date" name="dari" defaultValue={dari}
            className="border border-green-200 rounded-xl p-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-500">Sampai tanggal</label>
          <input type="date" name="sampai" defaultValue={sampai}
            className="border border-green-200 rounded-xl p-2" />
        </div>
        <button type="submit"
          className="bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl">
          Tampilkan
        </button>
        <PrintButton />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-100 rounded-2xl p-4">
          <div className="text-sm text-emerald-800">Jumlah transaksi</div>
          <div className="text-2xl font-bold text-emerald-900">{Number(ringkas.jumlah)}</div>
        </div>
        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="text-sm text-sky-800">Total produk terjual</div>
          <div className="text-2xl font-bold text-sky-900">{totalTerjual}</div>
        </div>
        <div className="bg-amber-100 rounded-2xl p-4">
          <div className="text-sm text-amber-800">Total pendapatan</div>
          <div className="text-2xl font-bold text-amber-900">{rupiah(totalPendapatan)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Kode</th>
              <th className="p-3">Nama produk</th>
              <th className="p-3">Terjual</th>
              <th className="p-3">Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.kode} className="border-t border-green-100">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{r.kode}</td>
                <td className="p-3">{r.nama}</td>
                <td className="p-3">{Number(r.terjual)}</td>
                <td className="p-3">{rupiah(Number(r.pendapatan))}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  Belum ada penjualan di periode ini
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="bg-green-50 font-semibold">
              <tr className="border-t border-green-100">
                <td className="p-3" colSpan="3">Total</td>
                <td className="p-3">{totalTerjual}</td>
                <td className="p-3">{rupiah(totalPendapatan)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}