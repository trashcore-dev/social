import axios from "axios";

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      res.status(400).json({ error: "Missing URL parameter" });
      return;
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile Safari/604.1"
      },
      maxRedirects: 5
    });

    const data = response.data;

    const video = data.match(/"contentUrl":"(https:\/\/v1\.pinimg\.com\/videos\/[^\"]+\.mp4)"/);
    const image =
      data.match(/"imageSpec_736x":\{"url":"(https:\/\/i\.pinimg\.com\/736x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/) ||
      data.match(/"imageSpec_564x":\{"url":"(https:\/\/i\.pinimg\.com\/564x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/);

    if (video) {
      res.status(200).json({ platform: "pinterest", type: "video", media: video[1] });
      return;
    }

    if (image) {
      res.status(200).json({ platform: "pinterest", type: "image", media: image[1] });
      return;
    }

    res.status(404).json({ error: "No media found." });
  } catch (err) {
    console.error("❌ Pinterest API Error:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
}
