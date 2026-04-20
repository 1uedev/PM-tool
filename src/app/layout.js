import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";

export const metadata = {
  title: "PM Copilot",
  description: "KI-gestütztes Produktmanagementsystem",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="bg-white text-gray-900 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
