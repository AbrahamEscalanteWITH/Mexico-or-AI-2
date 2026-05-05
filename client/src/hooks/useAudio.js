import { useRef, useEffect, useCallback } from 'react';

// Simple audio manager — keeps references to audio objects so we don't recreate them
const audioCache = {};

function getAudio(src) {
  if (!audioCache[src]) {
    audioCache[src] = new Audio(src);
  }
  return audioCache[src];
}

/**
 * useAudio — returns helpers to play/stop sounds
 */
export function useAudio() {
  const bgRef = useRef(null);

  const playBg = useCallback((src, volume = 0.4) => {
    // Stop current bg if different
    if (bgRef.current && bgRef.current.src !== window.location.origin + src) {
      bgRef.current.pause();
      bgRef.current.currentTime = 0;
    }
    const audio = getAudio(src);
    audio.loop = true;
    audio.volume = volume;
    bgRef.current = audio;
    audio.play().catch(() => {}); // ignore autoplay block
  }, []);

  const stopBg = useCallback(() => {
    if (bgRef.current) {
      bgRef.current.pause();
      bgRef.current.currentTime = 0;
    }
  }, []);

  const playSfx = useCallback((src, volume = 0.8) => {
    const audio = getAudio(src);
    audio.currentTime = 0;
    audio.volume = volume;
    audio.loop = false;
    audio.play().catch(() => {}); // ignore autoplay block
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bgRef.current) bgRef.current.pause();
    };
  }, []);

  return { playBg, stopBg, playSfx };
}
