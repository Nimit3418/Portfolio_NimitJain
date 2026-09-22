export default async function handler(req, res) {
  // Edge caching: cache at edge for 1 hour (3600s)
  // Serve stale content while revalidating for up to 1 day (86400s)
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  
  // Use exact Channel ID as requested
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY || !CHANNEL_ID) {
    return res.status(500).json({ error: 'Missing YouTube API credentials' });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('No channel found');
    }

    const stats = data.items[0].statistics;

    return res.status(200).json({
      subscribers: Number(stats.subscriberCount),
      views: Number(stats.viewCount),
      videos: Number(stats.videoCount)
    });
  } catch (error) {
    console.error('YouTube Fetch Error:', error);
    return res.status(500).json({ error: 'Failed to fetch YouTube stats' });
  }
}
