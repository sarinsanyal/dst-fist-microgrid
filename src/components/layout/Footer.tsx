// src/components/layout/Footer.tsx
import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { navLinks } from "@/lib/nav-links";

export default function Footer() {
  return (
    <footer className="bg-red-dark text-white mt-20">
      <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* About */}
        <div>
          <h3 className="font-serif font-bold text-base mb-4">DST FIST Microgrid Lab</h3>
          <p className="text-sm text-white/75 leading-relaxed">
            A research lab supported under the DST FIST scheme, working on
            microgrid systems, control, and renewable integration at the
            Department of Power Engineering, Jadavpur University.
          </p>
          <Link
            href="https://jadavpuruniversity.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white mt-4 transition-colors"
          >
            Jadavpur University <ExternalLink size={13} />
          </Link>
          <Link
            href="https://jadavpuruniversity.in/academics/power-engineering/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white mt-4 transition-colors"
          >
            Department of Power Engineering <ExternalLink size={13} />
          </Link>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-serif font-bold text-base mb-4">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-white/75 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif font-bold text-base mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>
                Department of Power Engineering<br />
                Salt Lake Campus<br />
                Jadavpur University<br />
                Plot No. 8, Salt Lake Bypass,<br />
                LB Block, Sector-III,<br />
                Salt Lake City, Kolkata – 7000106
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="shrink-0" />
              <a href="mailto:lab-email@jadavpuruniversity.in" className="hover:text-white transition-colors">
                lab-email@jadavpuruniversity.in
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="shrink-0" />
              <a href="tel:+913324146666" className="hover:text-white transition-colors">
                +91 33 2414 6666
              </a>
            </li>
          </ul>
        </div>

        {/* Find Us */}
        <div>
          <h3 className="font-serif font-bold text-base mb-4">Find Us</h3>
          <div className="rounded-md overflow-hidden border border-white/15 h-50">
            <iframe
              src="https://www.google.com/maps?q=Jadavpur+University+Salt+Lake+Campus&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(0.3) contrast(1.1)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Jadavpur University location"
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/15">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/55">
          <p>© {new Date().getFullYear()} DST FIST Microgrid Lab, Jadavpur University. All rights reserved.</p>
          <p>Funded under the DST FIST Scheme, Govt. of India</p>
        </div>
      </div>
    </footer>
  );
}