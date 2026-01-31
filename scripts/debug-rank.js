
const BASE_URL = "https://mapi.geofani.online/api";

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
}

async function debug() {
    try {
        console.log("Fetching Rank...");
        const json = await fetchJson(`${BASE_URL}/rank`);
        console.log("Keys:", Object.keys(json));

        if (json.movie && json.movie.length > 0) {
            console.log("Top Movie:", json.movie[0].title, json.movie[0].imdbRatingValue);
        }
        if (json.tv && json.tv.length > 0) {
            console.log("Top Series:", json.tv[0].title, json.tv[0].imdbRatingValue);
        }

    } catch (e) {
        console.error("Debug failed:", e);
    }
}

debug();
