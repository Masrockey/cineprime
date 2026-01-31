"use client";

import { useEffect, useRef, useState } from "react";
import { savePlaybackProgress } from "@/lib/history-service";
import { createClient } from "@/lib/supabase/client";

interface DracinPlayerProps {
    id: string;
    episode: number;
    title: string;
    poster: string;
    streamUrl: string;
}

export function DracinPlayer({ id, episode, title, poster, streamUrl }: DracinPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [startTime, setStartTime] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('history')
                .select('last_position, episode')
                .eq('user_id', user.id)
                .eq('subject_id', id)
                .eq('type', 'dracin')
                .single();

            if (data && data.episode === episode) {
                setStartTime(data.last_position);
                if (videoRef.current) {
                    videoRef.current.currentTime = data.last_position;
                }
            }
        };

        fetchHistory();
    }, [id, episode, supabase]);

    useEffect(() => {
        const interval = setInterval(() => {
            handleSave();
        }, 15000);

        return () => {
            clearInterval(interval);
            handleSave();
        };
    }, [id, episode, title, poster]);

    const handleSave = () => {
        if (!videoRef.current || videoRef.current.currentTime === 0) return;

        savePlaybackProgress({
            subjectId: id,
            type: 'dracin',
            title,
            poster,
            episode,
            lastPosition: videoRef.current.currentTime,
            duration: videoRef.current.duration
        });
    };

    return (
        <div className="w-full h-full bg-black">
            <video
                ref={videoRef}
                src={streamUrl}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                autoPlay
                className="w-full h-full"
                onLoadedData={() => {
                    if (startTime > 0 && videoRef.current) {
                        videoRef.current.currentTime = startTime;
                    }
                }}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
