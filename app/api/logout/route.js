import { cookies } from "next/headers";

export async function POST(request) {
  const cookieStore = await cookies();
  cookieStore.delete("token");

  return Response.redirect(new URL("/login", request.url), 303);
}