import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import LogoBar from "@/components/sections/LogoBar";
import FeatureHighlights from "@/components/sections/FeatureHighlights";
import Testimonials from "@/components/sections/Testimonials";
import CtaBanner from "@/components/sections/CtaBanner";

export const metadata = { title: "PM Copilot — AI-powered product management" };

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/projects");

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Hero />
      <LogoBar />
      <FeatureHighlights />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </div>
  );
}
