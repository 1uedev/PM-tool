import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: SITE.name,
  description: SITE.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-dark text-white antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
