// services/beholdService.js
const axios = require('axios');
const BeholdData = require('../models/beholdData.js');
const fetchBeholdData = async () => {
try {
const response = await axios.get("https://feeds.behold.so/rq0Or6Yrgq9bUX4OSGIC");
const posts = response.data.posts;
for (let post of posts) {
        if (post.id && post.timestamp && post.permalink && post.mediaUrl) {
            try {
                await BeholdData.updateOne({ postId: post.id }, { $set: post }, { upsert: true });
            } catch (dbError) {
                console.error(`Database error while processing post ${post.id}:`, dbError.message);
            }
        } else {
            console.warn(`Skipping post with invalid or missing id: ${JSON.stringify(post)}`);
        }
    }
    console.log("Behold API data processed successfully.");
} catch (error) {
    console.error("Error fetching Behold API data:", error.message);
    // Melempar error agar bisa ditangkap oleh pemanggil fungsi ini
    throw new Error("Failed to fetch Behold data.");
}
};
module.exports = { fetchBeholdData };