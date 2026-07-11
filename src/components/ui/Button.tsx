"use client";

/**
 * Styled button with cute animations
 */

import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const variantStyles = {
  primary:
    "bg-[var(--color-accent)] text-white shadow-soft hover:brightness-110",
  secondary:
    "bg-[var(--color-accent-light)] text-[var(--color-text)] hover:brightness-105",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-glass)]",
  danger: "bg-red-400/20 text-red-500 hover:bg-red-400/30",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-base rounded-2xl",
  lg: "px-8 py-3.5 text-lg rounded-2xl",
  icon: "p-3 rounded-full",
};

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ariaLabel,
}: ButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        font-body font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
