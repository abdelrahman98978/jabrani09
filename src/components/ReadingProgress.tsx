import { useState, useEffect } from "react";

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      
      if (documentHeight > 0) {
        const progressValue = (scrollTop / documentHeight) * 100;
        setProgress(Math.min(100, Math.max(0, progressValue)));
      }
    };

    window.addEventListener("scroll", calculateProgress);
    calculateProgress(); // Initial calculation
    
    return () => window.removeEventListener("scroll", calculateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-muted/30">
      <div
        className="h-full reading-progress transition-all duration-150 ease-out"
        style={{ 
          width: `${progress}%`,
          background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))"
        }}
      />
    </div>
  );
};

export default ReadingProgress;
