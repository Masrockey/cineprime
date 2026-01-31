import { createClient } from "@/lib/supabase/client";

export const savePlaybackProgress = async ({
    subjectId,
    type,
    title,
    poster,
    season,
    episode,
    lastPosition,
    duration
}: {
    subjectId: string;
    type: 'movie' | 'series' | 'dracin';
    title: string;
    poster: string;
    season?: number;
    episode?: number;
    lastPosition: number;
    duration: number;
}) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        const { error } = await supabase
            .from('history')
            .upsert({
                user_id: user.id,
                subject_id: subjectId,
                type,
                title,
                poster,
                season: season || null,
                episode: episode || null,
                last_position: Math.floor(lastPosition),
                duration: Math.floor(duration),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,subject_id,type'
            });

        if (error) console.error("Error saving history:", error);
    } catch (e) {
        console.error("Save progress error:", e);
    }
};
