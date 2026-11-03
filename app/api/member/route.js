import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

async function cekAdmin() {
  const session = await getSession();
  return session && session.role === "admin";
}

export async function GET() {
  if (!(await cekAdmin())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  const [rows] = await pool.query(
    "SELECT id, kode, nama, no_hp, dibuat FROM members ORDER BY id DESC"
  );
  return Response.json(rows);
}

export async function POST(request) {
  if (!(await cekAdmin())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { nama, no_hp } = await request.json();
  if (!nama || !nama.trim() || !no_hp || !no_hp.trim()) {
    return Response.json({ error: "Nama dan nomor HP wajib diisi" }, { status: 400 });
  }
  if (!/^[0-9+\s-]{8,15}$/.test(no_hp.trim())) {
    return Response.json({ error: "Nomor HP tidak valid" }, { status: 400 });
  }

  try {
    const [hasil] = await pool.query(
      "INSERT INTO members (nama, no_hp) VALUES (?, ?)",
      [nama.trim(), no_hp.trim()]
    );
    await pool.query("UPDATE members SET kode = ? WHERE id = ?", [
      `MBR-${1000 + hasil.insertId}`,
      hasil.insertId,
    ]);
    return Response.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Nomor HP sudah terdaftar" }, { status: 400 });
    }
    return Response.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}