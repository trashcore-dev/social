import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing Pinterest link." });

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" },
      maxRedirects: 5
    });

    const video = data.match(/"contentUrl":"(https:\/\/v1\.pinimg\.com\/videos\/[^\"]+\.mp4)"/);
    const image = data.match(/"imageSpec_736x":\{"url":"(https:\/\/i\.pinimg\.com\/736x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/)
                || data.match(/"imageSpec_564x":\{"url":"(https:\/\/i\.pinimg\.com\/564x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/);
    const title = data.match(/"name":"([^"]+)"/);
    const author = data.match(/"fullName":"([^"]+)".+?"username":"([^"]+)"/);

    res.json({
      type: video ? "video" : "image",
      title: title ? title[1] : "Untitled",
      author: author ? author[1] : "-",
      username: author ? author[2] : "-",
      media: video ? video[1] : image ? image[1] : "-",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
