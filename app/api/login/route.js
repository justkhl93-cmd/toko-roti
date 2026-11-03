import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function POST(request) {
  const { username, password } = await request.json();

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return Response.json(
      { error: "Username atau password salah" },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({
    id: user.id,
    nama: user.nama,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return Response.json({ role: user.role });
}