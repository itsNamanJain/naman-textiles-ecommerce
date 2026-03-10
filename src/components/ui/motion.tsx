"use client";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { forwardRef, type ReactNode } from "react";

// Custom easing curves
const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const;

// Fade in animation
export const FadeIn = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: easeOutQuad }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
FadeIn.displayName = "FadeIn";

// Fade in when in view
export const FadeInView = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={
        prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px", amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: easeOutQuad }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
FadeInView.displayName = "FadeInView";

// Scale on hover
export const ScaleOnHover = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; scale?: number }
>(({ children, scale = 1.02, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ scale }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    {...props}
  >
    {children}
  </motion.div>
));
ScaleOnHover.displayName = "ScaleOnHover";

// Slide in from left
export const SlideInLeft = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={
        prefersReduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }
      }
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: easeOutQuad }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
SlideInLeft.displayName = "SlideInLeft";

// Slide in from right
export const SlideInRight = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={
        prefersReduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
      }
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: easeOutQuad }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
SlideInRight.displayName = "SlideInRight";

// Stagger children animation container
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; staggerDelay?: number }
>(({ children, staggerDelay = 0.08, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
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

// Stagger item (use inside StaggerContainer)
export const StaggerItem = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode }
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    {...props}
  >
    {children}
  </motion.div>
));
StaggerItem.displayName = "StaggerItem";

// Pulse animation (for loading states, badges, etc.)
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

// Page transition wrapper
export const PageTransition = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode }
>(({ children, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: easeOutQuad }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
PageTransition.displayName = "PageTransition";

// Export motion and AnimatePresence for custom animations
export { motion, AnimatePresence };
