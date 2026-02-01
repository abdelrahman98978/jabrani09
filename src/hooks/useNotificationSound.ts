import { useState, useEffect, useCallback, useRef } from "react";

interface NotificationSoundSettings {
  isMuted: boolean;
  volume: number;
}

const STORAGE_KEY = "notification_sound_settings";

const DEFAULT_SETTINGS: NotificationSoundSettings = {
  isMuted: false,
  volume: 0.5,
};

export const useNotificationSound = () => {
  const [settings, setSettings] = useState<NotificationSoundSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (settings.isMuted) return;

    try {
      const audioContext = getAudioContext();
      
      // Resume audio context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;
      
      // Create a pleasant two-tone notification sound
      const frequencies = [880, 1174.66]; // A5 and D6 notes
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Apply volume setting
        const maxGain = settings.volume * 0.3;
        
        // Fade in and out for a smooth sound
        gainNode.gain.setValueAtTime(0, now + (index * 0.1));
        gainNode.gain.linearRampToValueAtTime(maxGain, now + (index * 0.1) + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + (index * 0.1) + 0.3);
        
        oscillator.start(now + (index * 0.1));
        oscillator.stop(now + (index * 0.1) + 0.35);
      });
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [settings.isMuted, settings.volume, getAudioContext]);

  const toggleMute = useCallback(() => {
    setSettings(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  return {
    isMuted: settings.isMuted,
    volume: settings.volume,
    playNotificationSound,
    toggleMute,
    setVolume,
  };
};
