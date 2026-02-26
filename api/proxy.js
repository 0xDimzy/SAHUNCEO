import axios from 'axios';

const DRAMABOX_API_BASE = 'https://dramabox.dramabos.my.id/api/v1';
const MELOLO_API_BASE = 'https://melolo.dramabos.my.id/api';
const NETSHORT_API_BASE = 'https://netshort.dramabos.my.id/api';
const REELIFE_API_BASE = 'https://reelife.dramabos.my.id/api/v1';

const getApiKey = () => process.env.DRAMABOX_API_KEY || 'A179DA133C8F05A184D12D5823D8062A';

const getProviderConfig = (provider) => {
  switch (provider) {
    case 'proxy':
      return { baseUrl: DRAMABOX_API_BASE, apikeyHeader: true, ensureCode: false };
    case 'melolo':
      return { baseUrl: MELOLO_API_BASE, apikeyHeader: true, ensureCode: true };
    case 'netshort':
      return { baseUrl: NETSHORT_API_BASE, apikeyHeader: false, ensureCode: false };
    case 'reelife':
      return { baseUrl: REELIFE_API_BASE, apikeyHeader: false, ensureCode: false };
    default:
      return null;
  }
};

const toPath = (rawPath) => {
  if (Array.isArray(rawPath)) return rawPath.join('/');
  if (typeof rawPath === 'string') return rawPath;
  return '';
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const provider = String(req.query.provider || '');
    const endpoint = toPath(req.query.path);
    const config = getProviderConfig(provider);

    if (!config || !endpoint) {
      res.status(400).json({ error: 'Invalid provider or endpoint path' });
      return;
    }

    const params = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (key === 'provider' || key === 'path') return;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const apiKey = getApiKey();

    if (provider === 'melolo' && !params.has('code')) {
      params.append('code', apiKey);
    }
    if (provider === 'netshort' && endpoint.startsWith('watch/') && !params.has('code')) {
      params.append('code', apiKey);
    }
    if (provider === 'reelife' && (endpoint.startsWith('play/') || endpoint.includes('/episode/')) && !params.has('code')) {
      params.append('code', apiKey);
    }

    const query = params.toString();
    const url = `${config.baseUrl}/${endpoint}${query ? `?${query}` : ''}`;

    const response = await axios.get(url, {
      timeout: 30000,
      headers: config.apikeyHeader ? { apikey: apiKey } : undefined,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error?.response) {
      res.status(error.response.status).json(error.response.data);
      return;
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
