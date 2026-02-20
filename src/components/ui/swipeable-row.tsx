"use client";

import { motion, useAnimation, PanInfo } from "framer-motion";
import { ReactNode } from "react";

interface SwipeableRowProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
}: SwipeableRowProps) {
  const controls = useAnimation();

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    if (info.offset.x < -swipeThreshold && onSwipeLeft) {
      // Swiped far enough left
      await controls.start({ x: -1000, transition: { duration: 0.2 } });
      onSwipeLeft();
    } else if (info.offset.x > swipeThreshold && onSwipeRight) {
      // Swiped far enough right
      await controls.start({ x: 1000, transition: { duration: 0.2 } });
      onSwipeRight();
    } else {
      // Snap back if threshold not met
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* Background action hints (visible when dragging) */}
      <div className="absolute inset-0 flex items-center justify-between bg-zinc-800 px-6">
        <span className="font-bold text-emerald-500 opacity-0 transition-opacity">Action</span>
        {onSwipeRight && <span className="font-bold text-rose-500 opacity-50">Delete</span>}
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 w-full touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
