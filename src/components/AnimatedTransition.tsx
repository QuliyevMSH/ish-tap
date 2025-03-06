
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

const variants = {
  left: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  right: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  up: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  down: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
};

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  direction = 'up',
  className = '',
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[direction]}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={className}
      style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTransition;
