'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';

const RotatingCoin = ({ src, alt = 'Rotating coin' }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start({
        rotateY: 360,
        transition: {
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        },
      });
    }
  }, [controls, isInView]);

  return (
    <div className="flex justify-center my-12" ref={ref}>
      <motion.div
        animate={controls}
        className="w-48 h-48 md:w-64 md:h-64 relative"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          priority
        />
      </motion.div>
    </div>
  );
};

export default RotatingCoin;
