import axios from "axios";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Missing URL parameter" });

    // Fetch page HTML
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile Safari/604.1",
      },
      maxRedirects: 5,
    });

    // Extract data
    const video = data.match(
      /"contentUrl":"(https:\/\/v1\.pinimg\.com\/videos\/[^\"]+\.mp4)"/
    );
    const image =
      data.match(
        /"imageSpec_736x":\{"url":"(https:\/\/i\.pinimg\.com\/736x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/
      ) ||
      data.match(
        /"imageSpec_564x":\{"url":"(https:\/\/i\.pinimg\.com\/564x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/
      );

    const title = data.match(/"name":"([^"]+)"/);
    const author = data.match(/"fullName":"([^"]+)".+?"username":"([^"]+)"/);

    // Build response
    const result = {
      platform: "Pinterest",
      type: video ? "video" : "image",
      title: title ? title[1] : "Untitled",
      author: author ? author[1] : "Unknown",
      username: author ? author[2] : "-",
      media: video ? video[1] : image ? image[1] : null,
    };

    if (!result.media)
      return res
        .status(404)
        .json({ error: "No media found on this Pinterest link." });

    res.status(200).json(result);
  } catch (err) {
    console.error("Pinterest API Error:", err.message);
    res.status(500).json({
      error: "Failed to fetch or parse Pinterest content.",
      message: err.message,
    });
  }
}
