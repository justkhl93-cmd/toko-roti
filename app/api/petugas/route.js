import pool from "@/lib/db";
import bcrypt from "bcryptjs";
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
    "SELECT id, username, nama FROM users WHERE role = 'kasir' ORDER BY id"
  );
  return Response.json(rows);
}

export async function POST(request) {
  if (!(await cekAdmin())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { username, nama, password } = await request.json();
  if (!username || !nama || !password) {
    return Response.json({ error: "Semua kolom wajib diisi" }, { status: 400 });
  }

  const hash = bcrypt.hashSync(password, 10);

  try {
    await pool.query(
      "INSERT INTO users (username, nama, password, role) VALUES (?, ?, ?, 'kasir')",
      [username, nama, hash]
    );
    return Response.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Username sudah dipakai" }, { status: 400 });
    }
    return Response.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}