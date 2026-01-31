'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Season } from '@/lib/api';
import { useMemo, useState, useEffect } from 'react';

interface EpisodeSelectorProps {
    seasons: Season[];
    currentSeason: number;
    currentEpisode: number;
}

export function EpisodeSelector({ seasons, currentSeason, currentEpisode }: EpisodeSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Default to first season if currentSeason is 0
    const [selectedSeason, setSelectedSeason] = useState<string>(
        currentSeason > 0 ? currentSeason.toString() : (seasons[0]?.se.toString() || '1')
    );

    const activeSeason = useMemo(() =>
        seasons.find(s => s.se.toString() === selectedSeason),
        [seasons, selectedSeason]
    );

    const episodes = useMemo(() => {
        if (!activeSeason) return [];
        return Array.from({ length: activeSeason.maxEp }, (_, i) => i + 1);
    }, [activeSeason]);

    const handleSeasonChange = (val: string) => {
        setSelectedSeason(val);
        // When season changes, we don't necessarily update URL until episode is picked?
        // Or we can just reset episode logic. 
        // Let's just update local state, user must pick episode.
    };

    const handleEpisodeChange = (val: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('season', selectedSeason);
        params.set('episode', val);
        router.push(`${pathname}?${params.toString()}`);
    };

    // Update local state if prop changes (e.g. navigation)
    useEffect(() => {
        if (currentSeason > 0) {
            setSelectedSeason(currentSeason.toString());
        }
    }, [currentSeason]);

    return (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Season</span>
                <Select value={selectedSeason} onValueChange={handleSeasonChange}>
                    <SelectTrigger className="w-[140px] bg-gray-950 border-gray-700">
                        <SelectValue placeholder="Select Season" />
                    </SelectTrigger>
                    <SelectContent>
                        {seasons.map((season) => (
                            <SelectItem key={season.se} value={season.se.toString()}>
                                Season {season.se}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Episode</span>
                <Select
                    value={currentEpisode > 0 && currentSeason.toString() === selectedSeason ? currentEpisode.toString() : ''}
                    onValueChange={handleEpisodeChange}
                    disabled={!activeSeason}
                >
                    <SelectTrigger className="w-[140px] bg-gray-950 border-gray-700">
                        <SelectValue placeholder="Select Episode" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {episodes.map((ep) => (
                            <SelectItem key={ep} value={ep.toString()}>
                                Episode {ep}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
