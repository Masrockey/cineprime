
const BASE_URL = "https://mapi.geofani.online/api";

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
}

async function debug() {
    try {
        console.log("Fetching Search 'a'...");
        const json = await fetchJson(`${BASE_URL}/search?keyword=a&page=1`);
        // Check if search response has a pager or total
        console.log("Keys:", Object.keys(json));
        if (json.pager) {
            console.log("Search Pager:", JSON.stringify(json.pager, null, 2));
        } else {
            console.log("No pager in search response.");
            console.log("Items length:", Array.isArray(json) ? json.length : (json.items ? json.items.length : 'unknown'));
        }

    } catch (e) {
        console.error("Debug failed:", e);
    }
}

debug();
