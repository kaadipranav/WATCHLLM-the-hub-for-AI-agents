"use client";
import { useRef, useMemo } from "react";
import { motion, useInView, type Transition } from "framer-motion";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Record<string, string | number>[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
}

export default function BlurText({
  text,
  delay = 0.05,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  animationFrom,
  animationTo,
  onAnimationComplete,
}: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  const defaultFrom = useMemo(
    () =>
      animationFrom ?? {
        filter: "blur(10px)",
        opacity: 0,
        y: direction === "top" ? -10 : 10,
      },
    [animationFrom, direction]
  );

  const defaultTo = useMemo(
    () => animationTo ?? [{ filter: "blur(0px)", opacity: 1, y: 0 }],
    [animationTo]
  );

  const elements =
    animateBy === "words" ? text.split(" ") : text.split("");

  // Merge keyframes
  const toSnapshot = defaultTo[defaultTo.length - 1] ?? {};

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((segment, index) => {
        const spanTransition: Transition = {
          duration: 0.5,
          delay: index * delay,
          ease: "easeOut",
        };

        return (
          <motion.span
            key={index}
            initial={defaultFrom}
            animate={inView ? toSnapshot : defaultFrom}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1
                ? onAnimationComplete
                : undefined
            }
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
          </motion.span>
        );
      })}
    </p>
  );
}
