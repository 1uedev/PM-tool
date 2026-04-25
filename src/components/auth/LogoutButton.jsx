"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button.jsx";

export default function LogoutButton({ className = "" }) {
  const t = useTranslations("auth");
  return (
    <Button
      variant="ghost"
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      {t("logout")}
    </Button>
  );
}
