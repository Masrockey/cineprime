import { useState, useEffect, useRef } from 'react';
import { X, Settings } from 'lucide-react';
import { Caption, SourceData } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { savePlaybackProgress } from '@/lib/history-service';

interface VideoPlayerProps {
    url: string;
    captions?: Caption[];
    sources?: SourceData[];
    onQualityChange?: (source: SourceData) => void;
    currentResolution?: number;
    onClose: () => void;
    // History Props
    subjectId?: string;
    type?: 'movie' | 'series' | 'dracin';
    title?: string;
    poster?: string;
    season?: number;
    episode?: number;
    startTime?: number;
}

export default function VideoPlayer({
    url,
    captions = [],
    sources = [],
    onQualityChange,
    currentResolution,
    onClose,
    subjectId,
    type,
    title,
    poster,
    season,
    episode,
    startTime = 0
}: VideoPlayerProps) {
    const [processedCaptions, setProcessedCaptions] = useState<{ id: string; url: string; label: string; lang: string }[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [savedTime, setSavedTime] = useState(startTime);
    const supabase = createClient();

    // Initial load restoration
    useEffect(() => {
        if (videoRef.current && savedTime > 0) {
            videoRef.current.currentTime = savedTime;
        }
    }, [url]);

    // History Tracking
    useEffect(() => {
        if (!subjectId || !type || !title) return;

        const interval = setInterval(() => {
            saveProgress();
        }, 15000); // Save every 15 seconds

        return () => {
            clearInterval(interval);
            saveProgress(); // Final save on unmount
        };
    }, [subjectId, type, title, season, episode]);

    const saveProgress = async () => {
        if (!videoRef.current || !subjectId || !type || !title) return;

        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;

        if (currentTime === 0 && duration === 0) return;

        savePlaybackProgress({
            subjectId,
            type,
            title,
            poster: poster || '',
            season,
            episode,
            lastPosition: currentTime,
            duration
        });
    };


    useEffect(() => {
        const processCaptions = async () => {
            if (!captions.length) return;

            const processed = await Promise.all(
                captions.map(async (cap) => {
                    try {
                        const response = await fetch(cap.url);
                        if (!response.ok) return null;
                        const srtText = await response.text();

                        // Simple SRT to VTT conversion:
                        // 1. Replace commas in timestamps with dots
                        // 2. Add WEBVTT header
                        const vttText = "WEBVTT\n\n" + srtText.replace(/(^\d+)\s+$/gm, '$1').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');

                        const blob = new Blob([vttText], { type: 'text/vtt' });
                        const blobUrl = URL.createObjectURL(blob);

                        return {
                            id: cap.id,
                            url: blobUrl,
                            label: cap.lanName,
                            lang: cap.lan
                        };
                    } catch (error) {
                        console.error("Failed to process caption:", cap.lanName, error);
                        return null;
                    }
                })
            );

            const validCaptions = processed.filter((c): c is { id: string; url: string; label: string; lang: string } => c !== null);
            setProcessedCaptions(validCaptions);
        };

        processCaptions();

        // Cleanup blob URLs
        return () => {
            processedCaptions.forEach(c => URL.revokeObjectURL(c.url));
        };
    }, [captions]);

    const handleQualityChange = (source: SourceData) => {
        if (videoRef.current) {
            setSavedTime(videoRef.current.currentTime);
        }
        setShowQualityMenu(false);
        if (onQualityChange) {
            onQualityChange(source);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center">
            {/* Quality Selector */}
            {sources.length > 0 && onQualityChange && (
                <div className="absolute top-4 right-16 z-50">
                    <button
                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                        className="text-white hover:text-primary p-2 bg-black/50 rounded-full flex items-center gap-2"
                    >
                        <Settings className="w-6 h-6" />
                        <span className="font-bold text-sm hidden md:block">{currentResolution ? `${currentResolution}p` : 'Quality'}</span>
                    </button>

                    {showQualityMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded shadow-xl py-2 w-32">
                            {sources.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleQualityChange(s)}
                                    className={`block w-full text-left px-4 py-2 hover:bg-gray-800 transition text-sm ${currentResolution === s.resolution ? 'text-primary font-bold' : 'text-gray-300'
                                        }`}
                                >
                                    {s.resolution}p
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-red-500 z-50 p-2 bg-black/50 rounded-full"
            >
                <X className="w-8 h-8" />
            </button>
            <video
                ref={videoRef}
                src={url}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                autoPlay
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
                onLoadedData={() => {
                    // Restore time if needed (usually handled by useEffect on url change, but redundant check safe)
                    if (videoRef.current && savedTime > 0 && Math.abs(videoRef.current.currentTime - savedTime) > 1) {
                        videoRef.current.currentTime = savedTime;
                    }
                }}
            >
                {processedCaptions.map((cap) => (
                    <track
                        key={cap.id}
                        kind="subtitles"
                        src={cap.url}
                        srcLang={cap.lang}
                        label={cap.label}
                        default={cap.lang === 'en' || cap.lang.startsWith('en')}
                    />
                ))}
            </video>
        </div>
    );
}
