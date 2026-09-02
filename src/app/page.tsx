import HeroCarousel from "@/components/home/HeroCarousel";
import NewsPanel from "@/components/home/NewsPanel";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-stretch">
        <div className="flex flex-col gap-6">
          <HeroCarousel />
          <section className="border-t border-ink/10 pt-6">
            <h2 className="font-serif text-3xl font-bold text-red-primary">
              DST FIST Smart Microgrid Lab
            </h2>
            <p className="mt-3 text-ink-soft leading-relaxed">
              We design AI-driven control, optimization, and monitoring solutions
              for microgrids and distributed energy resources — bridging power
              engineering with modern machine learning.
            </p>
          </section>
        </div>
        <NewsPanel />
      </div>
    </main>
  );
}