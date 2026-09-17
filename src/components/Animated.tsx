"use client";

import {
  ReactNode,
  useLayoutEffect,
  useRef,
} from "react";

import gsap from "gsap";

export function Animated({
  children,
}: {
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          y: 12,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        }
      );
    }, ref);

    return () => {
      ctx.revert();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}