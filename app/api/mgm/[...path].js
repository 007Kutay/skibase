export default async function handler(req, res) {
  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const mgmSubPath = '/' + pathSegments.join('/');

  const { path: _path, ...queryParams } = req.query;
  const qs = new URLSearchParams(queryParams).toString();
  const mgmUrl = `https://servis.mgm.gov.tr${mgmSubPath}${qs ? '?' + qs : ''}`;

  try {
    const response = await fetch(mgmUrl, {
      headers: {
        Accept: 'application/json',
        Referer: 'https://www.mgm.gov.tr',
        Origin: 'https://www.mgm.gov.tr',
      },
    });

    if (!response.ok) {
      return res.status(response.status).end();
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
