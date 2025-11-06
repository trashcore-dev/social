import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL." });

  try {
    const form = new URLSearchParams();
    form.append("q", url);
    form.append("vt", "home");

    const { data } = await axios.post("https://yt5s.io/api/ajaxSearch", form, {
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (data.status !== "ok") throw new Error("Invalid or unsupported link.");
    const $ = cheerio.load(data.data);

    // Facebook
    if (/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i.test(url)) {
      const thumb = $("img").attr("src");
      let links = [];
      $("table tbody tr").each((_, el) => {
        const quality = $(el).find(".video-quality").text().trim();
        const link = $(el).find("a.download-link-fb").attr("href");
        if (quality && link) links.push({ quality, link });
      });

      if (links.length > 0) return res.json({ platform: "facebook", type: "video", thumb, media: links[0].link });
      if (thumb) return res.json({ platform: "facebook", type: "image", media: thumb });
      throw new Error("Media not found.");
    }

    // Instagram
    else if (/^(https?:\/\/)?(www\.)?(instagram\.com\/(p|reel)\/).+/i.test(url)) {
      const video = $('a[title="Download Video"]').attr("href");
      const image = $("img").attr("src");
      if (video) return res.json({ platform: "instagram", type: "video", media: video });
      if (image) return res.json({ platform: "instagram", type: "image", media: image });
      throw new Error("Media not found.");
    }

    else throw new Error("Invalid link.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
