
const BASE_URL = "https://mapi.geofani.online/api";
const subjectId = "8955962000002143264"; // Monster ID

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
}

async function debug() {
    try {
        console.log("Fetching Detail...");
        const detail = await fetchJson(`${BASE_URL}/detail?url=${subjectId}`);
        // Log resource structure to see seasons/episodes
        console.log("Detail Resource:", JSON.stringify(detail.resource, null, 2));

        console.log("\nFetching Sources (0, 0)...");
        try {
            const json0 = await fetchJson(`${BASE_URL}/sources?subjectId=${subjectId}`);
            console.log("Sources (0,0):", json0.downloads ? json0.downloads.length : 0, "processed:", json0.processedSources ? json0.processedSources.length : 0);
        } catch (e) {
            console.log("Sources (0,0) failed:", e.message);
        }

        console.log("\nFetching Sources (1, 1)...");
        try {
            const json1 = await fetchJson(`${BASE_URL}/sources?subjectId=${subjectId}&season=1&episode=1`);
            console.log("Sources (1,1):", json1.downloads ? json1.downloads.length : 0, "processed:", json1.processedSources ? json1.processedSources.length : 0);
        } catch (e) {
            console.log("Sources (1,1) failed:", e.message);
        }
    } catch (e) {
        console.error("Debug failed:", e);
    }
}

debug();
