"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useRef } from "react";

const slides = [
  { src: "/home/campus-1.jpg", alt: "Jadavpur University Salt Lake Campus" },
  { src: "/home/lab-1.jpg", alt: "Microgrid Lab" },
  { src: "/home/lab-2.jpg", alt: "Lab equipment" },
  { src: "/home/lab-3.jpg", alt: "Lab equipment 2" },
];

export default function HeroCarousel() {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const [emblaRef] = useEmblaCarousel({ loop: true }, [autoplay.current]);

  return (
    <div ref={emblaRef} className="overflow-hidden rounded-md h-105">
      <div className="flex h-full">
        {slides.map((slide) => (
          <div key={slide.src} className="relative min-w-full h-full">
            <Image src={slide.src} alt={slide.alt} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          </div>
        ))}
      </div>
      
    </div>
  );
}