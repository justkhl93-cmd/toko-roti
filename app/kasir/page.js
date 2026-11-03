import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import KasirClient from "./KasirClient";

export default async function KasirPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <KasirClient nama={session.nama} />;
}