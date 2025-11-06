import axios from "axios";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL parameter" });

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile Safari/604.1"
      },
      maxRedirects: 5
    });

    const video = data.match(/"contentUrl":"(https:\/\/v1\.pinimg\.com\/videos\/[^\"]+\.mp4)"/);
    const image =
      data.match(/"imageSpec_736x":\{"url":"(https:\/\/i\.pinimg\.com\/736x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/) ||
      data.match(/"imageSpec_564x":\{"url":"(https:\/\/i\.pinimg\.com\/564x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/);

    if (video) return res.status(200).json({ type: "video", url: video[1] });
    if (image) return res.status(200).json({ type: "image", url: image[1] });

    return res.status(404).json({ error: "No media found." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
