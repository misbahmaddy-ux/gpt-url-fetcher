const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { url, mode = "light" } = req.body;

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
      timeout: 15000
    });

    let html = response.data;
    const $ = cheerio.load(html);

    // Remove heavy tags
    $("script, style, noscript, iframe").remove();

    // Extract core data
    const title = $("title").first().text().trim();
    const description = $('meta[name="description"]').attr("content") || "";
    const h1 = $("h1").first().text().trim();
    const headings = [];
    $("h1, h2, h3, h4").each((_, el) => {
      headings.push({
        tag: $(el).get(0).tagName.toUpperCase(),
        text: $(el).text().trim()
      });
    });

    // Extract main text content
    const text = $("body").text().replace(/\s+/g, " ").trim();

    // Handle modes
    const limits = {
      light: 8000, // good for audits
      full: 100000 // max safe for Vercel/OpenAI
    };
    const limit = limits[mode] || limits.light;

    const safeText = text.slice(0, limit);
    const safeHTML = $.html().slice(0, limit);

    // ✅ Structured audit output
    return res.status(200).json({
      url,
      mode,
      title,
      description,
      h1,
      headings,
      text: safeText,
      length: safeText.length,
      htmlLength: safeHTML.length
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to fetch content.",
      url
    });
  }
};
