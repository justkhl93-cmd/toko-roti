import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;
  await pool.query("DELETE FROM users WHERE id = ? AND role = 'kasir'", [id]);
  return Response.json({ ok: true });
}