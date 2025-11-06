import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL parameter" });

  try {
    const form = new URLSearchParams();
    form.append("q", url);
    form.append("vt", "home");

    const { data } = await axios.post("https://yt5s.io/api/ajaxSearch", form, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (data.status !== "ok") return res.status(400).json({ error: "Invalid URL" });

    const $ = cheerio.load(data.data);

    if (/facebook|fb\.watch/i.test(url)) {
      const thumb = $("img").attr("src");
      const links = [];
      $("table tbody tr").each((_, el) => {
        const quality = $(el).find(".video-quality").text().trim();
        const link = $(el).find("a.download-link-fb").attr("href");
        if (quality && link) links.push({ quality, link });
      });
      return res.status(200).json({ platform: "facebook", type: "video", media: links[0]?.link || thumb });
    }

    if (/instagram\.com/i.test(url)) {
      const video = $('a[title="Download Video"]').attr("href");
      const image = $("img").attr("src");
      return res.status(200).json({
        platform: "instagram",
        type: video ? "video" : "image",
        media: video || image
      });
    }

    return res.status(400).json({ error: "Unsupported URL" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
