"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

// Fade in animation
export const FadeIn = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
));
FadeIn.displayName = "FadeIn";

// Fade in when in view
export const FadeInView = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
));
FadeInView.displayName = "FadeInView";

// Scale on hover
export const ScaleOnHover = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; scale?: number }
>(({ children, scale = 1.02, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
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
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
));
SlideInLeft.displayName = "SlideInLeft";

// Slide in from right
export const SlideInRight = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
));
SlideInRight.displayName = "SlideInRight";

// Stagger children animation container
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: ReactNode; staggerDelay?: number }
>(({ children, staggerDelay = 0.1, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
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
    transition={{ duration: 0.4, ease: "easeOut" }}
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
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
));
PageTransition.displayName = "PageTransition";

// Export motion for custom animations
export { motion };
