
const BASE_URL = "https://dapi.geofani.online";

async function testDetail() {
    try {
        const id = "42000002888"; // ID from user example
        console.log(`Fetching detail for ${id}...`);
        const res = await fetch(`${BASE_URL}/api/detail/${id}/v2?lang=in`);
        const json = await res.json();

        if (json.success && json.data && json.data.drama) {
            console.log("Drama Name:", json.data.drama.name);
            console.log("Drama Cover:", json.data.drama.cover);
        } else {
            console.log("Failed or invalid structure:", JSON.stringify(json, null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

testDetail();
