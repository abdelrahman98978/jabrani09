import { useState, useEffect, useRef } from 'react';

interface TypewriterOptions {
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

const useTypewriter = (
  text: string,
  options: TypewriterOptions = {}
) => {
  const { speed = 80, delay = 0, onComplete } = options;
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const onCompleteRef = useRef(onComplete);
  const timeoutsRaw = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Reset state when text changes
    setDisplayText('');
    setIsComplete(false);
    setIsStarted(false);

    // Clear any existing timers
    timeoutsRaw.current.forEach(clearTimeout);
    timeoutsRaw.current = [];

    if (!text) {
      setIsComplete(true);
      return;
    }

    // Start delay timer
    const delayTimer = setTimeout(() => {
      setIsStarted(true);
      let currentIndex = 0;

      // We use a recursive setTimeout instead of setInterval for better control
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
          const timerId = setTimeout(typeNextChar, speed);
          timeoutsRaw.current.push(timerId);
        } else {
          setIsComplete(true);
          onCompleteRef.current?.();
        }
      };

      typeNextChar();

    }, delay);

    timeoutsRaw.current.push(delayTimer);

    return () => {
      timeoutsRaw.current.forEach(clearTimeout);
      timeoutsRaw.current = [];
    };
  }, [text, speed, delay]);

  return { displayText, isComplete, isStarted };
};

export default useTypewriter;
