import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export default async function AdminPage() {
  const session = await getSession();

  const jam =
    Number(
      new Date().toLocaleString("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Jakarta",
      })
    ) % 24;
  const sapaan =
    jam < 11
      ? "Selamat pagi"
      : jam < 15
      ? "Selamat siang"
      : jam < 18
      ? "Selamat sore"
      : "Selamat malam";

  const [[hariIni]] = await pool.query(
    "SELECT COALESCE(SUM(total), 0) AS omzet, COUNT(*) AS jumlah FROM transaksi WHERE DATE(tanggal) = CURDATE()"
  );
  const [[menipis]] = await pool.query(
    "SELECT COUNT(*) AS jumlah FROM products WHERE stok <= 10"
  );

  const kartu = "rounded-2xl p-6 shadow-sm";

  return (
    <div>
      <h1 className="text-3xl font-bold text-emerald-900">
        {sapaan}, {session.nama}
      </h1>
      <p className="text-gray-500 mt-1">Ini ringkasan toko hari ini.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <div className={kartu + " bg-emerald-100"}>
          <div className="text-sm text-emerald-800">Penjualan hari ini</div>
          <div className="text-3xl font-bold text-emerald-900 mt-2">
            {rupiah(Number(hariIni.omzet))}
          </div>
        </div>
        <div className={kartu + " bg-sky-100"}>
          <div className="text-sm text-sky-800">Transaksi hari ini</div>
          <div className="text-3xl font-bold text-sky-900 mt-2">
            {Number(hariIni.jumlah)}
          </div>
        </div>
        <div className={kartu + " bg-amber-100"}>
          <div className="text-sm text-amber-800">Produk stok menipis (10 ke bawah)</div>
          <div className="text-3xl font-bold text-amber-900 mt-2">
            {Number(menipis.jumlah)}
          </div>
        </div>
      </div>
    </div>
  );
}