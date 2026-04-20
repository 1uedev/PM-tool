"use client";

import { signOut } from "next-auth/react";
import Button from "@/components/ui/Button.jsx";

export default function LogoutButton({ className = "" }) {
  return (
    <Button
      variant="ghost"
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Abmelden
    </Button>
  );
}
