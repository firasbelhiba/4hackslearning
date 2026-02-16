'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  vimeoVideoId?: string;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  title?: string;
  onProgress?: (watchedSeconds: number, duration: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
}

// Cloudinary Video Player Component
function CloudinaryPlayer({
  cloudinaryPublicId,
  cloudinaryUrl,
  title,
  onProgress,
  onComplete,
  initialProgress = 0,
}: {
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  title?: string;
  onProgress?: (watchedSeconds: number, duration: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const hasCompletedRef = useRef(false);

  // Get Cloudinary cloud name from env or use default
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

  // Build video URL - prefer direct URL, fallback to constructed URL
  const videoSrc = cloudinaryUrl ||
    (cloudinaryPublicId
      ? `https://res.cloudinary.com/${cloudName}/video/upload/${cloudinaryPublicId}.mp4`
      : '');

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const videoDuration = videoRef.current.duration;
      setCurrentTime(current);
      onProgress?.(current, videoDuration);

      // Mark as complete when 90% watched
      if (videoDuration > 0 && current / videoDuration >= 0.9 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete?.();
      }
    }
  }, [onProgress, onComplete]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialProgress > 0 && initialProgress < videoRef.current.duration) {
        videoRef.current.currentTime = initialProgress;
      }
    }
  }, [initialProgress]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!videoSrc) {
    return <EmptyPlayer />;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !videoRef.current?.paused && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onComplete?.();
          }
        }}
        onClick={handlePlayPause}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Play button overlay */}
      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="w-20 h-20 rounded-full bg-brand border-2 border-black flex items-center justify-center shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
            style={{
              background: `linear-gradient(to right, #c6f135 0%, #c6f135 ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%, rgba(255,255,255,0.3) 100%)`,
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-brand transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-brand transition-colors"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-white hover:text-brand transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-brand transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Vimeo Embed Component
function VimeoPlayer({ vimeoVideoId, title }: { vimeoVideoId: string; title?: string }) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-black">
      <iframe
        src={`https://player.vimeo.com/video/${vimeoVideoId}?autoplay=0&title=0&byline=0&portrait=0`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title || 'Video'}
      />
    </div>
  );
}

// Empty State Component
function EmptyPlayer() {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-black flex items-center justify-center">
      <div className="text-center text-white">
        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No video available</p>
        <p className="text-sm text-gray-400 mt-2">Video content will appear here</p>
      </div>
    </div>
  );
}

// Custom HTML5 Video Player
function HTML5Player({
  videoUrl,
  onProgress,
  onComplete,
  initialProgress = 0,
}: {
  videoUrl: string;
  onProgress?: (watchedSeconds: number, duration: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const hasCompletedRef = useRef(false);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const videoDuration = videoRef.current.duration;
      setCurrentTime(current);
      onProgress?.(current, videoDuration);

      // Mark as complete when 90% watched (only once)
      if (videoDuration > 0 && current / videoDuration >= 0.9 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete?.();
      }
    }
  }, [onProgress, onComplete]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialProgress > 0 && initialProgress < videoRef.current.duration) {
        videoRef.current.currentTime = initialProgress;
      }
    }
  }, [initialProgress]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !videoRef.current?.paused && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onComplete?.();
          }
        }}
        onClick={handlePlayPause}
        playsInline
      />

      {/* Play button overlay */}
      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="w-20 h-20 rounded-full bg-brand border-2 border-black flex items-center justify-center shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
            style={{
              background: `linear-gradient(to right, #c6f135 0%, #c6f135 ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%, rgba(255,255,255,0.3) 100%)`,
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-brand transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-brand transition-colors"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-white hover:text-brand transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-brand transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main VideoPlayer Component
export function VideoPlayer({
  videoUrl,
  vimeoVideoId,
  cloudinaryPublicId,
  cloudinaryUrl,
  title,
  onProgress,
  onComplete,
  initialProgress = 0,
}: VideoPlayerProps) {
  // Cloudinary takes priority if public ID or URL is provided
  if (cloudinaryPublicId || cloudinaryUrl) {
    return (
      <CloudinaryPlayer
        cloudinaryPublicId={cloudinaryPublicId}
        cloudinaryUrl={cloudinaryUrl}
        title={title}
        onProgress={onProgress}
        onComplete={onComplete}
        initialProgress={initialProgress}
      />
    );
  }

  // Vimeo embed (legacy support)
  if (vimeoVideoId) {
    return <VimeoPlayer vimeoVideoId={vimeoVideoId} title={title} />;
  }

  // No video URL - show empty state
  if (!videoUrl) {
    return <EmptyPlayer />;
  }

  // HTML5 video player for direct URLs
  return (
    <HTML5Player
      videoUrl={videoUrl}
      onProgress={onProgress}
      onComplete={onComplete}
      initialProgress={initialProgress}
    />
  );
}
