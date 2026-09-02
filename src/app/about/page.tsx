// src/app/about/page.tsx
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 space-y-12">
      {/* Header Section */}
      <section className="space-y-4 border-b border-ink/10 pb-8">
        <span className="text-xs font-bold text-red-primary uppercase tracking-wide">
          About Us
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
          DST FIST Microgrid Laboratory
        </h1>
        <p className="text-lg text-ink-soft leading-relaxed font-serif italic">
          Department of Power Engineering, Jadavpur University
        </p>
      </section>

      {/* Main Narrative & Lab Overview */}
      <section className="space-y-6 text-ink leading-relaxed">
        <p className="text-base text-ink-soft">
          Established under the prestigious Department of Science and Technology (DST-FIST) grant scheme, the Microgrid Laboratory serves as an advanced facility dedicated to researching modern electrical grid architectures. As energy systems shift away from centralized fossil-fuel generation toward localized renewable microgrids, our primary focus is ensuring stability, reliability, and dynamic resilience in complex power networks.
        </p>
        
        {/* Main Lab Image Placeholder */}
        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-ink/10 bg-slate-100 my-8">
          <Image
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200"
            alt="DST FIST Microgrid Laboratory Equipment"
            fill
            className="object-cover"
            priority
          />
        </div>

        <h2 className="font-serif text-2xl font-bold text-ink pt-4">
          Core Research Focus & Infrastructure
        </h2>
        
        <p className="text-base text-ink-soft">
          Our research revolves around three critical pillars of modern decentralized energy: Solar Photovoltaics (PV), Battery Energy Storage Systems (BESS), and advanced Power Electronics. We specialize in designing high-efficiency bidirectional DC-DC and DC-AC converters, developing grid-forming control algorithms, and mitigating low-order harmonics during transient loads.
        </p>

        <p className="text-base text-ink-soft">
          Through continuous tracking protocols such as Maximum Power Point Tracking (MPPT) under partial shading conditions, alongside state-of-charge (SoC) management for battery arrays, our hardware and software testbeds simulate real-time islanding and grid-connected operations.
        </p>

        {/* Secondary Image Placeholder */}
        <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-ink/10 bg-slate-100 my-8">
          <Image
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200"
            alt="Solar PV and Power Electronics Integration"
            fill
            className="object-cover"
          />
        </div>

        <h2 className="font-serif text-2xl font-bold text-ink pt-4">
          Hardware Simulation & Industry Collaboration
        </h2>

        <p className="text-base text-ink-soft">
          The facility bridges numerical modeling and physical validation using hardware-in-the-loop (HIL) simulation setups. This infrastructure allows researchers, PhD scholars, and undergraduate students to test control algorithms safely before physical execution on active testbeds, accelerating technology deployment for smart grids, industrial microgrids, and remote electrification projects.
        </p>
      </section>
    </main>
  );
}