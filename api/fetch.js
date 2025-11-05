const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' in request body." });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const pageText = $("body").text().replace(/\s+/g, " ").trim();

    return res.status(200).json({ text: pageText });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to fetch content.",
    });
  }
};
