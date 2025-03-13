"use client";

import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div
      className="flex items-center justify-center min-h-[calc(100svh-112px)] w-full"
      data-aos="fade-zoom-in"
      data-aos-duration="1500"
      data-aos-easing="ease-in-out"
      data-aos-mirror="true"
    >
      <Image
        src="/nestad_logo.webp"
        alt="Nestad Logo"
        height={600}
        width={600}
        quality={100}
      />
    </div>
  );
}
