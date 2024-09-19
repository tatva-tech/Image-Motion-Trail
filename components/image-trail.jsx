'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { motion } from 'framer-motion';

const ImageTrail = () => {
  const contentRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mousePos = { x: 0, y: 0 };
    let lastMousePos = { ...mousePos };
    let cacheMousePos = { ...mousePos };
    let divs = [];
    let activeDivsCount = 0;
    let isIdle = true;
    let zIndexVal = 1;
    let divPosition = 0;
    const threshold = 80;

    const getPointerPos = (ev) => {
      return {
        x: ev.clientX,
        y: ev.clientY,
      };
    };

    const getMouseDistance = (p1, p2) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const lerp = (a, b, n) => (1 - n) * a + n * b;

    const handlePointerMove = (ev) => {
      mousePos = getPointerPos(ev);
    };

    const initializeDivs = () => {
      divs = [...contentRef.current.querySelectorAll('.content__div')].map((div) => ({
        el: div,
      }));
    };

    const showNextDiv = () => {
      ++zIndexVal;
      divPosition = divPosition < divs.length - 1 ? divPosition + 1 : 0;
      const div = divs[divPosition];

      gsap.killTweensOf(div.el);

      const timeline = gsap.timeline({
        onStart: () => {
          activeDivsCount++;
          isIdle = false;
        },
        onComplete: () => {
          activeDivsCount--;
          if (activeDivsCount === 0) {
            isIdle = true;
          }
        },
      });

      timeline
        .fromTo(
          div.el,
          {
            opacity: 1,
            scale: 0,
            zIndex: zIndexVal,
            x: cacheMousePos.x - 50,
            y: cacheMousePos.y - 50,
          },
          {
            duration: 0.4,
            ease: 'power1',
            scale: 1,
            x: mousePos.x - 50,
            y: mousePos.y - 50,
          },
          0
        )
        .to(
          div.el,
          {
            duration: 0.4,
            ease: 'power2',
            opacity: 0,
            scale: 0.2,
          },
          0.45
        );
    };

    const render = () => {
      const distance = getMouseDistance(mousePos, lastMousePos);

      cacheMousePos.x = lerp(cacheMousePos.x || mousePos.x, mousePos.x, 0.1);
      cacheMousePos.y = lerp(cacheMousePos.y || mousePos.y, mousePos.y, 0.1);

      if (distance > threshold) {
        showNextDiv();
        lastMousePos = mousePos;
      }

      if (isIdle && zIndexVal !== 1) {
        zIndexVal = 1;
      }

      requestAnimationFrame(render);
    };

    const initialize = () => {
      setIsLoading(false);
      initializeDivs();

      // Add mouseenter and mouseleave events to contentRef
      contentRef.current.addEventListener('mouseenter', () => {
        window.addEventListener('mousemove', handlePointerMove);
        requestAnimationFrame(render);
      });

      contentRef.current.addEventListener('mouseleave', () => {
        window.removeEventListener('mousemove', handlePointerMove);
      });
    };

    initialize();

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('mouseenter', () => {
          window.addEventListener('mousemove', handlePointerMove);
          requestAnimationFrame(render);
        });

        contentRef.current.removeEventListener('mouseleave', () => {
          window.removeEventListener('mousemove', handlePointerMove);
        });
      }
    };
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className={`demo-2 bg-black ${isLoading ? 'loading' : ''}`}
    >
      <div className="content" ref={contentRef}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl">
          Gallery
        </div>
        {[...Array(9)].map((_, index) => (
          <div
            key={index}
            className="content__div"
          >
            <Image
              src={`/images/${index}.webp`}
              alt={`Image ${index}`}
              height={100}
              width={300}
              className="content__div-inner object-cover"
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .content {
          position: relative;
          height: 100vh;
          width: 100vw;
        }

        .content__div {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          overflow: hidden;
          will-change: transform;
        }

        .content__div-inner {
          width: 100%;
          height: 100%;
          background-color: red;
        }

        .loading::before,
        .loading::after {
          content: '';
          position: fixed;
          z-index: 2000;
        }

        .loading::before {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #fff;
        }

        .loading::after {
          top: 50%;
          left: 50%;
          width: 60px;
          height: 60px;
          margin: -30px 0 0 -30px;
          border-radius: 50%;
          opacity: 0.4;
          background: #000;
          animation: loaderAnim 0.7s linear infinite alternate forwards;
        }

        @keyframes loaderAnim {
          to {
            opacity: 1;
            transform: scale3d(0.5, 0.5, 1);
          }
        }
      `}</style>
    </motion.main>
  );
};

export default ImageTrail;