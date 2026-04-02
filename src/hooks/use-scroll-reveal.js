"use client";

import { useEffect } from "react";

export function useScrollReveal(dependencies = []) {
  useEffect(() => {
    const elements = [...document.querySelectorAll(".reveal-on-scroll")];
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, dependencies);
}
