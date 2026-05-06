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
export function useAudio(isMuted = false) {
  const bgRef = useRef(null);

  useEffect(() => {
    if (bgRef.current) {
      bgRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const playBg = useCallback((src, volume = 0.4) => {
    // Stop current bg if different
    if (bgRef.current && bgRef.current.src !== window.location.origin + src) {
      bgRef.current.pause();
      bgRef.current.currentTime = 0;
    }
    const audio = getAudio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    bgRef.current = audio;
    audio.play().catch(() => {}); // ignore autoplay block
  }, [isMuted]);

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

  const fadeSfx = useCallback((src, duration = 1000) => {
    const audio = getAudio(src);
    if (audio.paused) return;
    
    const initialVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = initialVolume / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.currentTime = 0;
      } else {
        audio.volume = Math.max(0, initialVolume - (volumeStep * currentStep));
      }
    }, stepTime);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bgRef.current) bgRef.current.pause();
    };
  }, []);

  return { playBg, stopBg, playSfx, fadeSfx };
}
