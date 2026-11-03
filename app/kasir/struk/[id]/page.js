import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import PrintButton from "./PrintButton";

const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export default async function StrukPage({ params }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const [trx] = await pool.query("SELECT * FROM transaksi WHERE id = ?", [id]);
  if (trx.length === 0) notFound();

  const [items] = await pool.query(
    "SELECT * FROM detail WHERE transaksi_id = ?",
    [id]
  );
  const t = trx[0];

  const tanggal = new Date(t.tanggal).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="max-w-sm mx-auto bg-white p-6 shadow font-mono text-sm text-black">
        <div className="text-center">
          <div className="text-lg font-bold">TOKO ROTI</div>
          <div>Struk Pembelian</div>
        </div>

        <hr className="my-3 border-dashed" />

        <div>No : #{t.id}</div>
        <div>Tanggal : {tanggal}</div>
        <div>Kasir : {t.kasir}</div>
        {t.member_phone && <div>Member : {t.member_phone}</div>}

        <hr className="my-3 border-dashed" />

        {items.map((d) => (
          <div key={d.id} className="mb-2">
            <div>{d.nama}</div>
            <div className="flex justify-between">
              <span>
                {d.qty} x {rupiah(d.harga)}
              </span>
              <span>{rupiah(d.qty * d.harga)}</span>
            </div>
          </div>
        ))}

        <hr className="my-3 border-dashed" />

        <div className="flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span>{rupiah(t.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Bayar via</span>
          <span>{t.metode}</span>
        </div>
        {t.bayar != null && (
          <>
            <div className="flex justify-between">
              <span>Uang diterima</span>
              <span>{rupiah(t.bayar)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kembalian</span>
              <span>{rupiah(t.kembalian)}</span>
            </div>
          </>
        )}

        <hr className="my-3 border-dashed" />
        <div className="text-center">Terima kasih</div>
      </div>

      <div className="max-w-sm mx-auto mt-4 flex gap-2 print:hidden">
        <PrintButton />
        <Link
          href="/kasir"
          className="flex-1 text-center bg-green-100 hover:bg-green-200 py-2 rounded-lg text-emerald-900"
        >
          Transaksi Baru
        </Link>
      </div>
    </main>
  );
}