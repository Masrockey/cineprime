
export interface MovieImage {
    url: string;
    width: number;
    height: number;
}

export interface Subject {
    subjectId: string;
    subjectType: number; // 1 for Movie, 2 for Series
    title: string;
    description: string;
    releaseDate: string;
    genre: string;
    cover: MovieImage;
    image?: MovieImage;
    countryName: string;
    imdbRatingValue: string;
    detailPath: string;
    duration?: number;
    isDracin?: boolean;
}

export interface BannerItem {
    id: string;
    title: string;
    image: MovieImage;
    subjectId: string;
    subjectType: number;
    subject?: Subject;
    description?: string;
}

export interface HomeSection {
    type: string;
    title: string;
    subjects: Subject[];
    banner?: {
        items: BannerItem[];
    };
    customData?: {
        items: any[];
    };
}

export interface HomePageData {
    homeList: HomeSection[];
    operatingList: HomeSection[];
    platformList?: any[];
}

export interface Season {
    se: number;
    maxEp: number;
}

export interface Resource {
    seasons: Season[];
}

export interface MovieDetail {
    subject: Subject;
    resource?: Resource;
    stars?: any[];
}

export interface SourceData {
    id: string;
    url: string;
    resolution: number;
    size: string;
}

export interface SourcesResponse {
    downloads: SourceData[];
    captions?: Caption[];
    processedSources?: { quality: number, directUrl: string }[];
}


const BASE_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL || "#";

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "x-api-key": process.env.API_KEY || "masrockey"
};


export async function getHomepageData(): Promise<HomePageData> {
    const res = await fetch(`${BASE_URL}/home`, {
        next: { revalidate: 3600 },
        headers: HEADERS
    });
    if (!res.ok) {
        throw new Error("Failed to fetch homepage data");
    }
    const json = await res.json();
    return json;
}

export interface Caption {
    id: string;
    lan: string;
    lanName: string;
    url: string;
    size: string;
    delay: number;
}

export interface PlayerData {
    sources: SourceData[];
    captions: Caption[];
}

export async function getSources(subjectId: string, detailPath: string, season: number = 0, episode: number = 0): Promise<PlayerData> {
    const params = new URLSearchParams({
        subjectId,
        detailPath,
        season: season.toString(),
        episode: episode.toString()
    });

    const res = await fetch(`${BASE_URL}/download?${params.toString()}`, {
        next: { revalidate: 300 }, // 5 mins cache for download links
        headers: HEADERS
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(`getSources failed: ${res.status} ${text}`);
        throw new Error(`Failed to fetch sources: ${res.status}`);
    }

    const json = await res.json();
    const data = json;
    const sources: SourceData[] = [];

    // Map downloads to sources
    if (data.downloads && Array.isArray(data.downloads)) {
        sources.push(...data.downloads);
    }

    return {
        sources,
        captions: data.captions || []
    };
}

export async function getMovieDetail(subjectId: string): Promise<MovieDetail> {
    const res = await fetch(`${BASE_URL}/detail?subjectId=${subjectId}`, {
        next: { revalidate: 3600 },
        headers: HEADERS
    });
    if (!res.ok) {
        // console.error(`Failed to fetch detail for subjectId: ${subjectId}`);
        throw new Error(`Failed to fetch detail for ${subjectId}`);
    }
    const json = await res.json();
    return json; // The endpoint returns the detail object directly, not wrapped in data
}

export interface SearchResponse {
    items: Subject[];
    pager: Pager;
}

export async function getSearch(query: string, page: number = 1, signal?: AbortSignal): Promise<SearchResponse> {
    const url = `${BASE_URL}/search?keyword=${encodeURIComponent(query)}&page=${page}`;
    try {
        const res = await fetch(url, {
            next: { revalidate: 3600 },
            headers: HEADERS,
            signal
        });
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        return json;
    } catch (error: any) {
        if (error.name === 'AbortError') throw error;
        console.error(`[DEBUG] Search fetch failed for ${url}:`, error);
        throw error;
    }
}



export interface Pager {
    hasMore: boolean;
    nextPage: string;
    page: string;
    perPage: number;
    totalCount: number;
}

export interface TrendingResponse {
    subjectList: Subject[];
    pager: Pager;
}

export async function getTrending(page: number = 1): Promise<TrendingResponse> {
    const res = await fetch(`${BASE_URL}/trending?page=${page}`, { next: { revalidate: 3600 }, headers: HEADERS });
    if (!res.ok) throw new Error("Failed to fetch trending");
    const json = await res.json();
    return {
        subjectList: json.subjectList || [],
        pager: json.pager || { hasMore: false, nextPage: "1", page: "0", perPage: 18, totalCount: 0 }
    };
}

export async function getRank(): Promise<{ movie: Subject[], tv: Subject[] }> {
    const res = await fetch(`${BASE_URL}/rank`, { next: { revalidate: 3600 }, headers: HEADERS });
    if (!res.ok) throw new Error("Failed to fetch rank");
    const json = await res.json();
    return {
        movie: json.movie || [],
        tv: json.tv || []
    };
}

export async function getRecommendations(subjectId: string): Promise<Subject[]> {
    const res = await fetch(`${BASE_URL}/recommend?subjectId=${subjectId}`, { next: { revalidate: 3600 }, headers: HEADERS });
    if (!res.ok) {
        // Optional: Do not throw error here to avoid breaking the page if recommendations fail
        console.error("Failed to fetch recommendations");
        return [];
    }
    const json = await res.json();
    return json.items || [];
}

export async function generateStreamLink(url: string) {
    const res = await fetch(`${BASE_URL}/generate-stream-link?url=${encodeURIComponent(url)}`, {
        cache: 'no-store', // Do not cache generated stream links
        headers: HEADERS
    });
    if (!res.ok) {
        // If it fails, fallback to the original URL
        console.warn("generateStreamLink failed, using original url");
        return url;
    }
    const json = await res.json();
    if (json.streamUrl) {
        // Append API Key to the stream URL for player access
        const streamUrl = new URL(json.streamUrl);
        streamUrl.searchParams.append("apikey", process.env.API_KEY || "masrockey");
        return streamUrl.toString();
    }
    return url;
}
