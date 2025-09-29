const axios = require('axios');
const cheerio = require('cheerio');
const BeritaData = require('../models/beritaData.js');

async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        console.error(`Error fetching URL: ${url}`, error.message);
        return null;
    }
}

async function scrapeMainPage(url) {
    const html = await fetchHTML(url);
    if (!html) return [];
    const $ = cheerio.load(html);
    const articles = [];
    $(".timeline--item").each((i, el) => {
        const title = $(el).find(".artikel--content h2 a").text().trim();
        const link = $(el).find(".artikel--content h2 a").attr("href");
        const image = $(el).find(".artikel--img img").attr("src");
        const author = $(el).find(".thumb-user .user-box a").text().trim();
        const date = $(el).find(".thumb-user .date-box").text().trim();
        if (title && link) {
            articles.push({ title, link, image, author, date });
        }
    });
    return articles;
}

function cleanContent(content) {
    if (typeof content !== 'string') return content;
    return content.split("\n")[0].trim();
}

async function scrapeArticleContent(url) {
    const html = await fetchHTML(url);
    if (!html) return null;
    const $ = cheerio.load(html);
    const content = $('.read-content[itemprop="articleBody"]').text().trim();
    return cleanContent(content);
}

async function storeArticlesInDB(articles) {
    for (let article of articles) {
        try {
            await BeritaData.updateOne({ link: article.link }, { $set: article }, { upsert: true });
        } catch (dbError) {
            console.error(`Database error for article "${article.title}":`, dbError.message);
        }
    }
}

const refreshdatakompasiana = async () => {
    try {
        const baseUrl = "https://www.kompasiana.com/humasbapasjember405208";
        const articles = await scrapeMainPage(baseUrl);
        for (const article of articles) {
            const content = await scrapeArticleContent(article.link);
            article.content = content || "Content not available";
        }
        await storeArticlesInDB(articles);
        console.log("Kompasiana data processed successfully.");
    } catch (error) {
        console.error("Error refreshing Kompasiana data:", error.message);
        throw new Error("Failed to refresh Kompasiana data.");
    }
};

module.exports = { refreshdatakompasiana };