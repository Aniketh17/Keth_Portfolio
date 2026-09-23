import React, { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  onProgress?: (progress: number) => void;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ onProgress }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const SENSITIVITY = 0.8;

  const performSeek = () => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;

    if (!isSeekingRef.current) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
      if (onProgress) {
        onProgress(targetTimeRef.current / video.duration);
      }
    }
  };

  const handleSeeked = () => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video || !video.duration) return;

    // If target has changed while seeking, seek again to latest queued position
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.04) {
      performSeek();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration || isNaN(video.duration)) {
        prevXRef.current = e.clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const duration = video.duration;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * duration;
      const nextTime = Math.min(Math.max(targetTimeRef.current + timeOffset, 0), duration);
      targetTimeRef.current = nextTime;

      performSeek();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const clientX = e.touches[0].clientX;
        const video = videoRef.current;
        if (!video || !video.duration || isNaN(video.duration)) {
          prevXRef.current = clientX;
          return;
        }

        if (prevXRef.current === null) {
          prevXRef.current = clientX;
          return;
        }

        const delta = clientX - prevXRef.current;
        prevXRef.current = clientX;

        const duration = video.duration;
        const timeOffset = (delta / window.innerWidth) * SENSITIVITY * duration;
        const nextTime = Math.min(Math.max(targetTimeRef.current + timeOffset, 0), duration);
        targetTimeRef.current = nextTime;

        performSeek();
      }
    };

    const handleTouchEnd = () => {
      prevXRef.current = null;
    };

    // Scroll influence: scrub smoothly as page scrolls down
    const handleScroll = () => {
      const video = videoRef.current;
      if (!video || !video.duration || isNaN(video.duration)) return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollFraction = window.scrollY / scrollHeight;
      // Gently nudge target time with scroll if mouse is idle
      const scrollTime = scrollFraction * video.duration;
      targetTimeRef.current = Math.min(Math.max(scrollTime, 0), video.duration);
      performSeek();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      onSeeked={handleSeeked}
      src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4"
      muted
      playsInline
      preload="auto"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        objectPosition: '70% center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  );
};
