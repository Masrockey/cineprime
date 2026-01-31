
const BASE_URL = "https://mapi.geofani.online/api";

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
}

async function debug() {
    try {
        console.log("Fetching Trending...");
        const json = await fetchJson(`${BASE_URL}/trending?page=1`);
        console.log("Pager:", JSON.stringify(json.pager, null, 2));

        if (json.pager) {
            console.log("Total Count:", json.pager.totalCount);
        } else {
            console.log("No pager found");
        }

        console.log("Subject List Length:", json.subjectList ? json.subjectList.length : 0);

    } catch (e) {
        console.error("Debug failed:", e);
    }
}

debug();
