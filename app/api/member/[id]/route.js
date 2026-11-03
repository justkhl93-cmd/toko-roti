import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

async function cekAdmin() {
  const session = await getSession();
  return session && session.role === "admin";
}

export async function PUT(request, { params }) {
  if (!(await cekAdmin())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;
  const { nama, no_hp } = await request.json();

  if (!nama || !nama.trim() || !no_hp || !no_hp.trim()) {
    return Response.json({ error: "Nama dan nomor HP wajib diisi" }, { status: 400 });
  }
  if (!/^[0-9+\s-]{8,15}$/.test(no_hp.trim())) {
    return Response.json({ error: "Nomor HP tidak valid" }, { status: 400 });
  }

  try {
    await pool.query("UPDATE members SET nama = ?, no_hp = ? WHERE id = ?", [
      nama.trim(),
      no_hp.trim(),
      id,
    ]);
    return Response.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Nomor HP sudah terdaftar" }, { status: 400 });
    }
    return Response.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await cekAdmin())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;
  await pool.query("DELETE FROM members WHERE id = ?", [id]);
  return Response.json({ ok: true });
}