import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Maximize2, Move3D, Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Car360ViewerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  className?: string;
  type?: string;
}

const Car360Viewer = ({ videoUrl, thumbnailUrl, className = "", type = "equirectangular" }: Car360ViewerProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [View360Module, setView360Module] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // Dynamically import the View360 library
  useEffect(() => {
    const loadView360 = async () => {
      try {
        const module = await import("@egjs/react-view360");
        setView360Module(module);
      } catch (error) {
        console.error("Failed to load View360:", error);
        setIsError(true);
        setIsLoading(false);
      }
    };
    loadView360();
  }, []);

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.lookAt({ yaw: 0, pitch: 0 }, 500);
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleGyroToggle = async () => {
    if (viewerRef.current) {
      try {
        if (!gyroEnabled) {
          // Request permission for device orientation on iOS
          if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            if (permission !== 'granted') return;
          }
          viewerRef.current.control.enableGyro();
          setGyroEnabled(true);
        } else {
          viewerRef.current.control.disableGyro();
          setGyroEnabled(false);
        }
      } catch (error) {
        console.error("Gyro error:", error);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isError) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-secondary flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Move3D className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {isRTL ? "فشل تحميل عارض 360°" : "Failed to load 360° viewer"}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {isRTL ? "إعادة المحاولة" : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  const isVideo = videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('video');

  return (
    <div 
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden bg-black ${className} ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white text-lg">
            {isRTL ? "جاري تحميل العرض 360°..." : "Loading 360° view..."}
          </p>
        </div>
      )}
      
      {/* Thumbnail as placeholder */}
      {thumbnailUrl && isLoading && (
        <img 
          src={thumbnailUrl} 
          alt="360 preview" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      )}

      {/* 360 Viewer */}
      {View360Module && (
        <View360Module.default
          ref={viewerRef}
          className="w-full h-full"
          projection={new View360Module.EquirectProjection({
            src: videoUrl,
            video: isVideo
          })}
          onReady={() => setIsLoading(false)}
          onError={() => {
            setIsError(true);
            setIsLoading(false);
          }}
          autoplay={isVideo}
          autoResize
        />
      )}
      
      {/* Controls Overlay */}
      {!isLoading && (
        <>
          {/* Instructions */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm flex items-center gap-3 pointer-events-none">
            <span className="flex items-center gap-1">
              <Move3D className="h-4 w-4" />
              {isRTL ? "اسحب للتدوير" : "Drag to rotate"}
            </span>
            <span className="w-px h-4 bg-white/30" />
            <span>🔍 {isRTL ? "اضغط للتكبير" : "Pinch to zoom"}</span>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            {/* Left side buttons */}
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-black/70 hover:bg-black/90 text-white border-0"
                onClick={handleResetView}
              >
                <RotateCcw className="h-4 w-4 ml-1" />
                {isRTL ? "إعادة ضبط" : "Reset"}
              </Button>
              
              {/* Gyroscope toggle for mobile */}
              <Button 
                variant="secondary" 
                size="sm"
                className={`bg-black/70 hover:bg-black/90 text-white border-0 ${gyroEnabled ? 'ring-2 ring-primary' : ''}`}
                onClick={handleGyroToggle}
              >
                <Smartphone className="h-4 w-4 ml-1" />
                {isRTL ? "الجيروسكوب" : "Gyro"}
              </Button>
            </div>

            {/* Right side buttons */}
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-black/70 hover:bg-black/90 text-white border-0"
              onClick={handleFullscreen}
            >
              <Maximize2 className="h-4 w-4 ml-1" />
              {isFullscreen 
                ? (isRTL ? "إلغاء ملء الشاشة" : "Exit Fullscreen")
                : (isRTL ? "ملء الشاشة" : "Fullscreen")
              }
            </Button>
          </div>

          {/* 360 Badge */}
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
            <Move3D className="h-4 w-4" />
            360°
          </div>
        </>
      )}
    </div>
  );
};

export default Car360Viewer;
