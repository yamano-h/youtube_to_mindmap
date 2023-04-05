// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSubtitles } from 'youtube-captions-scraper';

export default async function handler(req, res) {
  const result = await getSubtitles({
    videoID: req.body.text, // youtube video id
    lang: 'ja' // default: `en`
  })
  res.status(200).json(result)
}
