import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import NotificationBell from "./NotificationBell.jsx";

export default async function Header({ title }) {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      {session?.user && (
        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="text-sm text-gray-500">
            {session.user.name ?? session.user.email}
          </span>
        </div>
      )}
    </header>
  );
}
