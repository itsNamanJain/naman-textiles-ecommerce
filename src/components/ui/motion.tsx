"use client";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import { forwardRef, useRef, type ReactNode, type MouseEvent } from "react";

// Custom easing curve
const easeOutCubic = [0.33, 1, 0.68, 1] as const;

// ─── Blur Fade In (Premium scroll reveal) ──────────────────────────
export const BlurFadeIn = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number; direction?: "up" | "down" | "left" | "right" }
>(({ children, delay = 0, direction = "up", ...props }, ref) => {
  const prefersReduced = useReducedMotion();

  const directionMap = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
  };

  const { x, y } = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y, x, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px", amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: easeOutCubic }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
BlurFadeIn.displayName = "BlurFadeIn";

// ─── Fade In ───────────────────────────────────────────────────────
export const FadeIn = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay, ease: easeOutCubic }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
FadeIn.displayName = "FadeIn";

// ─── Fade In When In View ──────────────────────────────────────────
export const FadeInView = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={
        prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 28, filter: "blur(10px)" }
      }
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px", amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: easeOutCubic }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
FadeInView.displayName = "FadeInView";

// ─── Scale On Hover ────────────────────────────────────────────────
export const ScaleOnHover = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; scale?: number }
>(({ children, scale = 1.03, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ scale }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    {...props}
  >
    {children}
  </motion.div>
));
ScaleOnHover.displayName = "ScaleOnHover";

// ─── 3D Tilt Card Effect ──────────────────────────────────────────
export const TiltCard = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; intensity?: number }
>(({ children, intensity = 10, style, ...props }, ref) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    rotateX.set((-mouseY / (rect.height / 2)) * intensity);
    rotateY.set((mouseX / (rect.width / 2)) * intensity);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={(node) => {
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={{ perspective: 1000, rotateX: springX, rotateY: springY, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
});
TiltCard.displayName = "TiltCard";

// ─── Magnetic Button Effect ───────────────────────────────────────
export const MagneticButton = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; strength?: number }
>(({ children, strength = 0.3, style, ...props }, ref) => {
  const btnRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={(node) => {
        (btnRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={{ x: springX, y: springY, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
});
MagneticButton.displayName = "MagneticButton";

// ─── Slide In From Left ───────────────────────────────────────────
export const SlideInLeft = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={
        prefersReduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -40, filter: "blur(8px)" }
      }
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: easeOutCubic }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
SlideInLeft.displayName = "SlideInLeft";

// ─── Slide In From Right ──────────────────────────────────────────
export const SlideInRight = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={
        prefersReduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 40, filter: "blur(8px)" }
      }
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: easeOutCubic }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
SlideInRight.displayName = "SlideInRight";

// ─── Stagger Container ───────────────────────────────────────────
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; staggerDelay?: number }
>(({ children, staggerDelay = 0.1, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
));
StaggerContainer.displayName = "StaggerContainer";

// ─── Stagger Item ─────────────────────────────────────────────────
export const StaggerItem = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode }
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={{
      hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
      visible: { opacity: 1, y: 0, filter: "blur(0px)" },
    }}
    transition={{ duration: 0.5, ease: easeOutCubic }}
    {...props}
  >
    {children}
  </motion.div>
));
StaggerItem.displayName = "StaggerItem";

// ─── Pulse Animation ─────────────────────────────────────────────
export const Pulse = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode }
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    {...props}
  >
    {children}
  </motion.div>
));
Pulse.displayName = "Pulse";

// ─── Count Up Animation ──────────────────────────────────────────
export const CountUp = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => {
        motionValue.set(0);
        // Animate to target value
        // Use spring for natural feel
        motionValue.set(value);
      }}
    >
      {rounded}
    </motion.span>
  );
};

// ─── Page Transition ─────────────────────────────────────────────
export const PageTransition = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode }
>(({ children, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: easeOutCubic }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
PageTransition.displayName = "PageTransition";

// ─── Floating Element (subtle hover float) ───────────────────────
export const FloatingElement = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; amplitude?: number; duration?: number }
>(({ children, amplitude = 8, duration = 3, ...props }, ref) => (
  <motion.div
    ref={ref}
    animate={{ y: [-amplitude, amplitude, -amplitude] }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    {...props}
  >
    {children}
  </motion.div>
));
FloatingElement.displayName = "FloatingElement";

// Export motion and AnimatePresence for custom animations
export { motion, AnimatePresence };
