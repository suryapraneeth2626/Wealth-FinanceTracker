import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface Props {
  value: number;
  format?: (v: number) => string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, format, className, duration = 1.1 }: Props) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (latest) =>
    format ? format(latest) : Math.round(latest).toLocaleString(),
  );
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return <motion.span className={className}>{display}</motion.span>;
}
