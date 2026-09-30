export default async (req, res) => {
  try {
    const query = encodeURIComponent('POPIA OR "Protection of Personal Information Act" OR "Information Regulator" South Africa');
    const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWSAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const articles = Array.isArray(data.articles) ? data.articles : [];

    const items = articles
      .filter(a => a && a.title && a.title !== '[Removed]')
      .slice(0, 6)
      .map(a => {
        const publishedDate = new Date(a.publishedAt);
        const daysAgo = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
        const rawBody = (a.description || a.content || '').replace(/\[\+\d+ chars\]$/, '').trim();
        return {
          title: a.title.length > 90 ? a.title.slice(0, 87) + '...' : a.title,
          body: rawBody.length > 200 ? rawBody.slice(0, 197) + '...' : rawBody,
          pill: daysAgo <= 2 ? 'New' : 'Update',
          pillClass: daysAgo <= 2 ? 'new' : 'upd',
          date: isNaN(publishedDate.getTime()) ? '' : publishedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          region: '🇿🇦',
          url: a.url || '',
          source: (a.source && a.source.name) || ''
        };
      })
      .filter(item => item.title && item.body);

    res.status(200).json({ articles: items });
  } catch (err) {
    res.status(500).json({ articles: [], error: 'news_fetch_failed' });
  }
}
