"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
    id: string;
    type: "movie" | "dracin";
    title: string;
    poster: string;
    className?: string;
}

export default function BookmarkButton({ id, type, title, poster, className }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        checkBookmark();
    }, [id]);

    const checkBookmark = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from("bookmarks")
                .select("id")
                .eq("user_id", user.id)
                .eq("subject_id", id)
                .eq("type", type)
                .single();

            if (data) {
                setIsBookmarked(true);
            }
        } catch (error) {
            console.error("Error checking bookmark:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleBookmark = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Please login to bookmark");
            setLoading(false);
            return;
        }

        if (isBookmarked) {
            // Remove
            const { error } = await supabase
                .from("bookmarks")
                .delete()
                .eq("user_id", user.id)
                .eq("subject_id", id)
                .eq("type", type);

            if (error) {
                toast.error("Failed to remove bookmark");
            } else {
                setIsBookmarked(false);
                toast.success("Removed from bookmarks");
            }
        } else {
            // Add
            const { error } = await supabase
                .from("bookmarks")
                .insert({
                    user_id: user.id,
                    subject_id: id,
                    type,
                    title,
                    poster
                });

            if (error) {
                console.error(error);
                toast.error("Failed to add bookmark");
            } else {
                setIsBookmarked(true);
                toast.success("Added to bookmarks");
            }
        }
        setLoading(false);
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleBookmark}
            disabled={loading}
            className={cn("bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all", className)}
        >
            {isBookmarked ? (
                <Bookmark className="h-5 w-5 text-red-500 fill-red-500" />
            ) : (
                <Bookmark className="h-5 w-5 text-white" />
            )}
        </Button>
    );
}
