import fs from "fs/promises";
import path from "path";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { kode } = await params;
  const form = await request.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const ekstensi = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[file.type];
  if (!ekstensi) {
    return Response.json({ error: "Format harus JPG, PNG, atau WEBP" }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return Response.json({ error: "Ukuran foto maksimal 2 MB" }, { status: 400 });
  }

  const [rows] = await pool.query("SELECT gambar FROM products WHERE kode = ?", [kode]);
  if (rows.length === 0) {
    return Response.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const folder = path.join(process.cwd(), "public", "produk");
  await fs.mkdir(folder, { recursive: true });

  const aman = kode.replace(/[^a-zA-Z0-9_-]/g, "");
  const namaFile = `${aman}-${Date.now()}.${ekstensi}`;
  await fs.writeFile(path.join(folder, namaFile), Buffer.from(await file.arrayBuffer()));

  const lama = rows[0].gambar;
  if (lama && lama.startsWith("/produk/")) {
    await fs.unlink(path.join(folder, path.basename(lama))).catch(() => {});
  }

  const url = `/produk/${namaFile}`;
  await pool.query("UPDATE products SET gambar = ? WHERE kode = ?", [url, kode]);

  return Response.json({ gambar: url });
}