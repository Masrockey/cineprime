// const fetch = require('node-fetch'); // Built-in in Node 18+

const BASE_URL = "http://localhost:7000";

async function testRecommend() {
    try {
        console.log("Fetching /api/recommend...");
        const res = await fetch(`${BASE_URL}/api/recommend?page=1&size=20&lang=in`);

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Raw text length:", text.length);
        console.log("Raw text start:", text.slice(0, 500));

        try {
            const json = JSON.parse(text);
            console.log("Parsed JSON Success:", json.success);

            if (json.data) {
                const keys = Object.keys(json.data);
                console.log("Keys in data:", keys);
                if (Array.isArray(json.data) && json.data.length > 0) {
                    console.log("First item sample:", JSON.stringify(json.data[0], null, 2));
                }
            }
        } catch (e) {
            console.error("JSON Parse Error:", e.message);
        }

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testRecommend();
