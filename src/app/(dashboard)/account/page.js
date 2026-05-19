import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import AccountForm from "@/components/account/AccountForm.jsx";

export const metadata = { title: "Mein Konto — PM Copilot" };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <header className="flex h-14 flex-shrink-0 items-center border-b border-gray-200 bg-white px-6">
        <h1 className="text-base font-semibold text-gray-900">Mein Konto</h1>
      </header>
      <main className="flex-1 p-6">
        <AccountForm user={user} />
      </main>
    </div>
  );
}
