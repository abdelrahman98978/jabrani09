import { useState, useEffect, useRef, useCallback } from 'react';

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
  const textRef = useRef(text);

  // Update refs when props change
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const startTyping = useCallback(() => {
    if (!text || text.length === 0) {
      setDisplayText('');
      setIsComplete(true);
      return;
    }

    setDisplayText('');
    setIsComplete(false);
    setIsStarted(false);

    const delayTimer = setTimeout(() => {
      setIsStarted(true);
      let currentIndex = 0;
      
      const typeTimer = setInterval(() => {
        const currentText = textRef.current;
        if (currentIndex < currentText.length) {
          setDisplayText(currentText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(typeTimer);
          onCompleteRef.current?.();
        }
      }, speed);

      return () => clearInterval(typeTimer);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [text, speed, delay]);

  useEffect(() => {
    const cleanup = startTyping();
    return cleanup;
  }, [startTyping]);

  return { displayText, isComplete, isStarted };
};

export default useTypewriter;
