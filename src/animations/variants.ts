/**
 * Shared animation variants for Framer Motion
 */

import type { Variants, Transition } from "framer-motion";

/** Gentle fade in from below */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/** Gentle fade in */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Scale in with spring */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

/** Stagger children animation */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/** Default spring transition */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/** Gentle transition for backgrounds */
export const gentleTransition: Transition = {
  duration: 1.5,
  ease: "easeInOut",
};

/** Floating animation for petals, hearts, etc. */
export const floatingAnimation = (delay = 0, duration = 6) => ({
  y: [0, -15, 0, 10, 0],
  x: [0, 8, -5, 3, 0],
  rotate: [0, 5, -3, 2, 0],
  transition: {
    duration,
    delay,
    repeat: Infinity,
    ease: "easeInOut",
  },
});

/** Drift animation for clouds, leaves */
export const driftAnimation = (duration = 30, direction = 1) => ({
  x: direction > 0 ? ["-10%", "110%"] : ["110%", "-10%"],
  transition: {
    duration,
    repeat: Infinity,
    ease: "linear",
  },
});

/** Pulse animation for audio-reactive elements */
export const pulseAnimation = (intensity: number) => ({
  scale: [1, 1 + intensity * 0.1, 1],
  opacity: [0.6, 0.6 + intensity * 0.4, 0.6],
  transition: { duration: 0.3 },
});

/** Page transition variants */
export const pageTransition: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

/** Slide up panel (for queue, modals) */
export const slideUpPanel: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0 },
};
