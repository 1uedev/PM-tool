import Hero from "@/components/sections/Hero";
import LogoBar from "@/components/sections/LogoBar";
import FeatureHighlights from "@/components/sections/FeatureHighlights";
import Testimonials from "@/components/sections/Testimonials";
import CtaBanner from "@/components/sections/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoBar />
      <FeatureHighlights />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
