import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { kode } = await params;
  const { nama, harga, stok } = await request.json();

  await pool.query(
    "UPDATE products SET nama = ?, harga = ?, stok = ? WHERE kode = ?",
    [nama, Number(harga) || 0, Number(stok) || 0, kode]
  );
  return Response.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { kode } = await params;
  await pool.query("DELETE FROM products WHERE kode = ?", [kode]);
  return Response.json({ ok: true });
}