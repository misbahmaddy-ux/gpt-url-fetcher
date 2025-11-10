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
    // Fetch full HTML
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      responseType: "text",
      timeout: 10000
    });

    // Load HTML into Cheerio
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract readable text
    const text = $("body").text().replace(/\s+/g, " ").trim();

    // Truncate if needed (for payload safety)
    const maxLength = 200000;
    const safeHTML = html.length > maxLength ? html.slice(0, maxLength) : html;
    const safeText = text.length > maxLength ? text.slice(0, maxLength) : text;

    // ✅ Return both HTML and parsed text
    return res.status(200).json({
      url,
      html: safeHTML,
      text: safeText,
      length: {
        html: safeHTML.length,
        text: safeText.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to fetch content."
    });
  }
};
