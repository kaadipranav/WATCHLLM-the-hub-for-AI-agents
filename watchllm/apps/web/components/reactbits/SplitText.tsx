"use client";
import React, { useRef, useMemo } from "react";
import { motion, useInView, type Transition } from "framer-motion";

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words";
  from?: Record<string, string | number>;
  to?: Record<string, string | number>;
  threshold?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: React.CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  delay = 50,
  duration = 0.6,
  splitType = "words",
  from,
  to,
  threshold = 0.1,
  tag = "p",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });

  const defaultFrom = useMemo(
    () => from ?? { opacity: 0, y: 40 },
    [from]
  );
  const defaultTo = useMemo(
    () => to ?? { opacity: 1, y: 0 },
    [to]
  );

  const lines = text.split("\n");

  const Tag = (tag || "p") as React.ElementType;

  return (
    <Tag
      ref={ref}
      style={{ textAlign, wordWrap: "break-word" } as React.CSSProperties}
      className={`${className}`}
    >
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {(splitType === "words" ? line.split(" ") : line.split("")).map(
            (segment, index) => {
              const globalIdx =
                lines
                  .slice(0, lineIdx)
                  .reduce(
                    (acc, l) =>
                      acc +
                      (splitType === "words"
                        ? l.split(" ").length
                        : l.split("").length),
                    0
                  ) + index;
              const totalSegments = lines.reduce(
                (acc, l) =>
                  acc +
                  (splitType === "words"
                    ? l.split(" ").length
                    : l.split("").length),
                0
              );
              const transition: Transition = {
                duration,
                delay: (globalIdx * delay) / 1000,
                ease: "easeOut",
              };

              return (
                <motion.span
                  key={`${lineIdx}-${index}`}
                  className="inline-block"
                  initial={defaultFrom}
                  animate={inView ? defaultTo : defaultFrom}
                  transition={transition}
                  onAnimationComplete={
                    globalIdx === totalSegments - 1
                      ? onLetterAnimationComplete
                      : undefined
                  }
                >
                  {segment === " " ? "\u00A0" : segment}
                  {splitType === "words" &&
                    index <
                      (splitType === "words"
                        ? line.split(" ").length
                        : line.split("").length) -
                        1 &&
                    "\u00A0"}
                </motion.span>
              );
            }
          )}
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default SplitText;
