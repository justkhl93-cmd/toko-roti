import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return new Response("Belum login", { status: 401 });
  }

  const { kode } = await params;
  const [rows] = await pool.query(
    "SELECT tipe, data FROM product_images WHERE kode = ?",
    [kode]
  );
  if (rows.length === 0) {
    return new Response("Tidak ada", { status: 404 });
  }

  return new Response(rows[0].data, {
    headers: {
      "Content-Type": rows[0].tipe,
      "Cache-Control": "private, max-age=31536000",
    },
  });
}