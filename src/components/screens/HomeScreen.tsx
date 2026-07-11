"use client";

/**
 * Home screen with personalized greeting for Mia
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getHomeMessage } from "@/utils/messages";
import { fadeInUp, staggerContainer } from "@/animations/variants";

export function HomeScreen() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(getHomeMessage());
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial={false}
      animate="visible"
      className="px-4 pb-32 pt-4 max-w-lg mx-auto"
    >
      <motion.div
        variants={fadeInUp}
        className="flex flex-col items-center text-center space-y-3 pt-16 md:pt-24"
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text)]">
          Hey Mia
        </h1>
        <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto min-h-[1.5rem]">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
}
