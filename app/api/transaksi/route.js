import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  const { items, member_phone, metode, bayar } = await request.json();

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Keranjang kosong" }, { status: 400 });
  }
  if (!["Tunai", "QRIS", "Debit"].includes(metode)) {
    return Response.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    const baris = [];

    for (const it of items) {
      const qty = Number(it.qty);
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error("Jumlah barang tidak valid");
      }

      const [rows] = await conn.query(
        "SELECT kode, nama, harga, stok FROM products WHERE kode = ? FOR UPDATE",
        [it.kode]
      );
      const p = rows[0];
      if (!p) throw new Error(`Barang ${it.kode} tidak ditemukan`);
      if (p.stok < qty) {
        throw new Error(`Stok ${p.nama} tidak cukup (sisa ${p.stok})`);
      }

      total += p.harga * qty;
      baris.push({ ...p, qty });
    }

    let uangDiterima = total;
    if (metode === "Tunai") {
      uangDiterima = Number(bayar);
      if (!Number.isInteger(uangDiterima) || uangDiterima < total) {
        throw new Error("Uang yang diterima kurang dari total belanja");
      }
    }
    const kembalian = uangDiterima - total;

    const [hasil] = await conn.query(
      "INSERT INTO transaksi (kasir, member_phone, metode, total, bayar, kembalian) VALUES (?, ?, ?, ?, ?, ?)",
      [session.nama, member_phone || null, metode, total, uangDiterima, kembalian]
    );
    const trxId = hasil.insertId;

    for (const b of baris) {
      await conn.query(
        "INSERT INTO detail (transaksi_id, kode, nama, harga, qty) VALUES (?, ?, ?, ?, ?)",
        [trxId, b.kode, b.nama, b.harga, b.qty]
      );
      await conn.query(
        "UPDATE products SET stok = stok - ? WHERE kode = ?",
        [b.qty, b.kode]
      );
    }

    await conn.commit();
    return Response.json({ id: trxId });
  } catch (e) {
    await conn.rollback();
    return Response.json({ error: e.message }, { status: 400 });
  } finally {
    conn.release();
  }
}