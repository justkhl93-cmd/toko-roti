import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

const TIPE_OK = ["image/png", "image/jpeg", "image/webp"];
const MAKS = 1024 * 1024; // 1 MB

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const p = await params;
  const kode = p.kode ?? p.id;

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "File tidak ditemukan" }, { status: 400 });
  }
  if (!TIPE_OK.includes(file.type)) {
    return Response.json({ error: "Format harus PNG, JPG, atau WEBP" }, { status: 400 });
  }
  if (file.size > MAKS) {
    return Response.json({ error: "Ukuran foto maksimal 1 MB" }, { status: 400 });
  }

  const [ada] = await pool.query("SELECT kode FROM products WHERE kode = ?", [kode]);
  if (ada.length === 0) {
    return Response.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const data = Buffer.from(await file.arrayBuffer());

  await pool.query(
    "INSERT INTO product_images (kode, tipe, data) VALUES (?, ?, ?) " +
      "ON DUPLICATE KEY UPDATE tipe = VALUES(tipe), data = VALUES(data)",
    [kode, file.type, data]
  );
  await pool.query("UPDATE products SET gambar = ? WHERE kode = ?", [
    `/api/foto/${encodeURIComponent(kode)}?v=${Date.now()}`,
    kode,
  ]);

  return Response.json({ ok: true });
}