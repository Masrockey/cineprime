import { cookies } from 'next/headers';

const BASE_URL = process.env.DRAMABOX_API_URL || "http://localhost:7000";

const HEADERS = {
    "x-api-key": process.env.API_KEY || "masrockey"
};


async function getLang() {
    try {
        const cookieStore = await cookies();
        return cookieStore.get('dracin_lang')?.value || 'in';
    } catch (e) {
        return 'in';
    }
}

export interface DramaboxItem {
    id: number;
    name: string;
    cover: string;
    chapterCount: number;
    introduction: string;
    tags: string[];
    playCount: number;
}

export interface DramaboxTag {
    tagId: number;
    tagName: string;
    tagEnName: string;
}

export interface DramaboxDetail {
    id: number;
    name: string;
    cover: string;
    introduction: string;
    tags: DramaboxTag[];
    chapterCount: number;
    playCount: number;
    releaseTime?: string;
    actors?: string[];
}

// Update interface to match reality (string IDs)
export interface DramaboxChapter {
    chapterId: string; // Changed from number to string as per chapters API
    chapterIndex: number;
    chapterName: string;
    videoPath: string; // m3u8 often in 'videoPath' or handled by stream endpoint
}

export async function getDracinHome(page: number = 1, size: number = 20): Promise<DramaboxItem[]> {
    try {
        const lang = await getLang();
        const res = await fetch(`${BASE_URL}/api/home?page=${page}&size=${size}&lang=${lang}`, {
            next: { revalidate: 3600 },
            headers: HEADERS
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error("getDracinHome error:", error);
        return [];
    }
}

export async function getDracinDetail(bookId: string): Promise<{ drama: DramaboxDetail | null, chapters: DramaboxChapter[] }> {
    try {
        const lang = await getLang();
        const [detailRes, chaptersData] = await Promise.all([
            fetch(`${BASE_URL}/api/detail/${bookId}/v2?lang=en`, { next: { revalidate: 3600 }, headers: HEADERS }), // Keep detail in EN if preferred or change to lang? Usually details like title might be better in local language if available, but let's stick to what works or use lang for consistency. Let's use 'en' for structure keys if they vary, but content might be better in 'lang'. Let's try to pass 'lang' but mapped to API codes. The user said ID/EN. API expects 'in' or 'en'.
            getDracinChapters(bookId)
        ]);

        if (!detailRes.ok) {
            // console.warn(`[getDracinDetail] Failed to fetch. Status: ${detailRes.status} for ID: ${bookId}`);
            // Return empty structure instead of throwing to prevent crashing Promise.all or clogging logs with stack traces
            return { drama: null, chapters: [] };
        }
        const json = await detailRes.json();

        let drama = null;
        if (json.success && json.data) {
            drama = json.data.drama;
            if (drama && !drama.cover) {
                // Fallback to constructed URL pattern based on ID
                drama.cover = `https://hwztchapter.dramaboxdb.com/data/cppartner/4x2/42x0/420x0/${drama.id}/${drama.id}.jpg`;
            }
        }

        // Use chapters from the specialized endpoint if available, otherwise fallback to detail's chapters
        const chapters = (chaptersData.length > 0) ? chaptersData : (json.data?.chapters || []);

        // Map to ensure type compatibility if needed (mostly id types)
        const formattedChapters: DramaboxChapter[] = chapters.map((c: any) => ({
            chapterId: String(c.chapterId),
            chapterIndex: c.chapterIndex,
            chapterName: c.chapterName,
            videoPath: c.videoPath
        }));

        return {
            drama: drama,
            chapters: formattedChapters
        };

    } catch (error) {
        console.error("getDracinDetail error:", error);
        return { drama: null, chapters: [] };
    }
}

export interface DracinStreamResponse {
    success: boolean;
    data?: {
        bookId: string;
        allEps: number;
        chapter: {
            video: {
                mp4?: string;
                m3u8?: string;
            };
        };
    };
}

// Interface for the detailed chapter response from /api/chapters
export interface DracinChapterDetail {
    chapterId: string;
    chapterIndex: number;
    chapterName: string;
    videoPath: string;
    cdnList: Array<{
        cdnDomain: string;
        videoPathList: Array<{
            quality: number;
            videoPath: string;
        }>;
    }>;
}

export async function getDracinChapters(bookId: string): Promise<DracinChapterDetail[]> {
    try {
        const lang = await getLang();
        // Request a large size to get all chapters (default might be small)
        const res = await fetch(`${BASE_URL}/api/chapters/${bookId}?lang=${lang}&size=300`, {
            next: { revalidate: 300 }, // 5 mins cache
            headers: HEADERS
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error("getDracinChapters error:", error);
        return [];
    }
}

export async function getDracinStream(bookId: string, episode: number): Promise<string | null> {
    // 1. Primary: Video path from Chapter List (Requested by user)
    try {
        const chapters = await getDracinChapters(bookId);
        // Find matching chapter. 
        // Note: 'episode' param passed from URL is typically the chapterIndex.
        const chapter = chapters.find(c => c.chapterIndex === episode);

        if (chapter && chapter.videoPath) {
            // Some videoPaths might be signed URLs that expire, so we don't cache this function result (already set in fetch options)
            return chapter.videoPath;
        }
    } catch (error) {
        console.error("getDracinStream (chapters) error:", error);
    }

    // 2. Fallback: Direct stream endpoint (Secondary/Backup)
    try {
        const lang = await getLang();
        const res = await fetch(`${BASE_URL}/api/stream?bookId=${bookId}&episode=${episode}&lang=${lang}`, {
            cache: 'no-store',
            headers: HEADERS
        });
        if (res.ok) {
            const json: DracinStreamResponse = await res.json();
            if (json.success && json.data && json.data.chapter && json.data.chapter.video) {
                return json.data.chapter.video.mp4 || json.data.chapter.video.m3u8 || null;
            }
        }
    } catch (error) {
        console.warn("getDracinStream /api/stream fallback failed", error);
    }

    return null;
}

const mapBookItem = (b: any): DramaboxItem => {
    let cover = b.coverWap || b.cover || "";
    if (cover && cover.startsWith('/')) {
        cover = `https://hwztchapter.dramaboxdb.com${cover}`;
    }
    const id = b.bookId || b.id;

    return {
        id: id,
        name: b.bookName || b.name,
        cover: cover,
        chapterCount: b.chapterCount,
        introduction: b.introduction,
        tags: b.tags || [],
        playCount: b.playCount || 0
    };
};

// Helper to extract books from nested column structure or parse flat list
function extractBooksFromColumns(data: any): DramaboxItem[] {
    if (!data) return [];

    // Check for double nested data
    const rootData = data.data || data;

    // Case 1: Array of Columns (e.g. VIP)
    // Or Case 2: Array of Books (e.g. Recommend, sometimes)
    // But API structure varies.

    // If it's an array directly
    if (Array.isArray(rootData)) {
        if (rootData.length === 0) return [];

        // Check first item to determine type
        const first = rootData[0];
        if (first.bookList && Array.isArray(first.bookList)) {
            // It's a list of Columns
            let allBooks: DramaboxItem[] = [];
            rootData.forEach((col: any) => {
                if (col.bookList && Array.isArray(col.bookList)) {
                    allBooks = [...allBooks, ...col.bookList.map(mapBookItem)];
                }
            });
            return allBooks;
        } else {
            // It's likely a list of Books directly
            return rootData.map(mapBookItem);
        }
    }

    // Case 3: Object with columnVoList
    const columns = rootData.columnVoList || data.columnVoList;
    if (columns && Array.isArray(columns)) {
        let allBooks: DramaboxItem[] = [];
        columns.forEach((col: any) => {
            if (col.bookList && Array.isArray(col.bookList)) {
                allBooks = [...allBooks, ...col.bookList.map(mapBookItem)];
            }
        });
        return allBooks;
    }

    return [];
}

export async function getDracinRecommend(page: number = 1, size: number = 20): Promise<DramaboxItem[]> {
    try {
        const lang = await getLang();
        const res = await fetch(`${BASE_URL}/api/recommend?page=${page}&size=${size}&lang=${lang}`, {
            next: { revalidate: 3600 },
            headers: HEADERS
        });
        if (!res.ok) return [];
        const json = await res.json();
        return extractBooksFromColumns(json.data);
    } catch (error) {
        console.error("getDracinRecommend error:", error);
        return [];
    }
}

export async function getDracinVip(page: number = 1, size: number = 20): Promise<DramaboxItem[]> {
    try {
        const lang = await getLang();
        const res = await fetch(`${BASE_URL}/api/vip?page=${page}&size=${size}&lang=${lang}`, {
            next: { revalidate: 3600 },
            headers: HEADERS
        });
        if (!res.ok) return [];
        const json = await res.json();
        return extractBooksFromColumns(json.data);
    } catch (error) {
        console.error("getDracinVip error:", error);
        return [];
    }
}

export async function searchDracin(keyword: string, page: number = 1, size: number = 20, signal?: AbortSignal): Promise<DramaboxItem[]> {
    try {
        const lang = await getLang();
        const url = `${BASE_URL}/api/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}&lang=${lang}`;
        const res = await fetch(url, {
            next: { revalidate: 0 },
            headers: HEADERS,
            signal
        });
        if (!res.ok) return [];
        const json = await res.json();

        // Search usually returns a specific list in data.list or just data
        const list = json.data?.list || (Array.isArray(json.data) ? json.data : []);

        // If it looks like a list of books (has bookId/id), map it
        if (list.length > 0 && (list[0].bookId || list[0].id)) {
            return list.map(mapBookItem);
        }

        return extractBooksFromColumns(json.data);
    } catch (error) {
        console.error("searchDracin error:", error);
        return [];
    }
}

export async function getDracinCategories() {
    try {
        const lang = await getLang();
        const res = await fetch(`${BASE_URL}/api/categories?lang=${lang}`, { headers: HEADERS });
        if (!res.ok) {
            throw new Error(`Failed to fetch categories: ${res.status}`);
        }
        const json = await res.json();
        // Check if data is array
        if (json.success && Array.isArray(json.data)) {
            return json.data as { id: number; name: string; replaceName: string; checked: boolean }[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching dracin categories:", error);
        return [];
    }
}

export async function getDracinCategoryDetail(id: string, page: number = 1, size: number = 20): Promise<{ books: DramaboxItem[], categoryName: string, totalPages: number }> {
    try {
        const lang = await getLang();
        const res = await fetch(`${BASE_URL}/api/category/${id}?page=${page}&size=${size}&lang=${lang}`, {
            next: { revalidate: 3600 },
            headers: HEADERS
        });
        if (!res.ok) return { books: [], categoryName: "", totalPages: 0 };
        const json = await res.json();

        if (json.success && json.data) {
            const books = json.data.bookList ? json.data.bookList.map(mapBookItem) : [];
            // Find current category name from types list if available, or just use ID/Placeholder
            let categoryName = "";
            if (json.data.types && Array.isArray(json.data.types)) {
                const currentType = json.data.types.find((t: any) => t.id == id);
                if (currentType) categoryName = currentType.name;
            }
            return {
                books,
                categoryName,
                totalPages: json.data.pages || 0
            };
        }
        return { books: [], categoryName: "", totalPages: 0 };
    } catch (error) {
        console.error("getDracinCategoryDetail error:", error);
        return { books: [], categoryName: "", totalPages: 0 };
    }
}
