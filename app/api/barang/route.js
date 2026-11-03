import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }
  const [rows] = await pool.query("SELECT * FROM products ORDER BY nama");
  return Response.json(rows);
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { kode, nama, harga, stok } = await request.json();
  if (!kode || !nama) {
    return Response.json({ error: "Kode dan nama wajib diisi" }, { status: 400 });
  }

  try {
    await pool.query(
      "INSERT INTO products (kode, nama, harga, stok) VALUES (?, ?, ?, ?)",
      [kode, nama, Number(harga) || 0, Number(stok) || 0]
    );
    return Response.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Kode barang sudah dipakai" }, { status: 400 });
    }
    return Response.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}