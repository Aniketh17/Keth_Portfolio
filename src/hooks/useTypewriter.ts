import { useState, useEffect } from 'react';


export function useTypewriter(
  text: string,
  speed: number = 38,
  startDelay: number = 600
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let delayTimer: ReturnType<typeof setTimeout> | null = null;

    setDisplayed('');
    setDone(false);

    delayTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          if (intervalId) clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
