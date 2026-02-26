import api from '../client';
import { normalizeDrama, normalizeNetshortList } from '../normalizers';
import { API_CODE, Episode } from '../types';

const BASE = '/api/netshort';

const normalizeDuration = (duration: any) => {
  if (typeof duration === 'number') {
    const mins = Math.floor(duration / 60);
    const secs = (duration % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
  if (duration) return duration;
  return '';
};

const episodeNumberFromItem = (ep: any, index: number) => {
  const raw =
    ep?.episode ??
    ep?.episodeNum ??
    ep?.episode_no ??
    ep?.episodeNo ??
    ep?.sort ??
    ep?.seq ??
    ep?.serialNo ??
    ep?.shortPlayEpisode ??
    ep?.shortPlayVideoEpisode ??
    ep?.id ??
    ep?.videoId ??
    index + 1;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : index + 1;
};

const isEpisodeCandidate = (item: any) => {
  if (!item || typeof item !== 'object') return false;
  return (
    item.episode !== undefined ||
    item.episodeNum !== undefined ||
    item.episode_no !== undefined ||
    item.episodeNo !== undefined ||
    item.shortPlayEpisode !== undefined ||
    item.shortPlayVideoEpisode !== undefined ||
    item.playUrl !== undefined ||
    item.videoUrl !== undefined ||
    item.url !== undefined
  );
};

const collectEpisodeCandidatesDeep = (input: any, maxDepth = 8): any[] => {
  const out: any[] = [];
  const walk = (node: any, depth: number) => {
    if (depth > maxDepth || node === null || node === undefined) return;
    if (Array.isArray(node)) {
      node.forEach((child) => walk(child, depth + 1));
      return;
    }
    if (typeof node !== 'object') return;

    if (isEpisodeCandidate(node)) {
      out.push(node);
    }

    for (const value of Object.values(node)) {
      if (value && (Array.isArray(value) || typeof value === 'object')) {
        walk(value, depth + 1);
      }
    }
  };

  walk(input, 0);
  return out;
};

const dedupeEpisodes = (episodes: Episode[]) => {
  const seen = new Set<string>();
  const out: Episode[] = [];
  for (const ep of episodes) {
    if (!ep.id || seen.has(ep.id)) continue;
    seen.add(ep.id);
    out.push(ep);
  }
  return out;
};

const getFirstNonEmptyList = async (paths: string[]) => {
  for (const path of paths) {
    try {
      const { data } = await api.get(`${BASE}${path}`);
      const normalized = normalizeNetshortList(data);
      if (normalized.length > 0) return normalized;
    } catch (error) {
      console.warn(`[NetShort] Request failed for ${path}`, error);
    }
  }
  return [];
};

const getBaseNetshortList = async (page = 1) => {
  const [homeList, listList] = await Promise.all([
    getFirstNonEmptyList([`/home/${page}?lang=in`, `/home/${page}`]),
    getFirstNonEmptyList([`/list/${page}?lang=in`, `/list/${page}`]),
  ]);

  // Merge to avoid empty homepage when one endpoint changes shape.
  const merged = [...homeList, ...listList];
  if (merged.length > 0) {
    const seen = new Set<string>();
    return merged.filter((item) => {
      const key = item.id || item.bookId || `${item.title}-${item.poster}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return getFirstNonEmptyList([`/home/${page}?lang=in`, `/home/${page}`, `/list/${page}?lang=in`, `/list/${page}`]);
};

export const netshortProvider = {
  async fetchHomepage(page = 1) {
    return getBaseNetshortList(page);
  },
  async fetchTrending() {
    return getBaseNetshortList(1);
  },
  async fetchLatest() {
    return getBaseNetshortList(1);
  },
  async fetchForYou() {
    return getBaseNetshortList(1);
  },
  async fetchVIP() {
    return getBaseNetshortList(1);
  },
  async fetchDubIndo(page = 1, _classify?: string) {
    return getBaseNetshortList(page);
  },
  async fetchRandom() {
    const list = await getBaseNetshortList(1);
    return list.sort(() => Math.random() - 0.5);
  },
  async searchDrama(query: string) {
    return getFirstNonEmptyList([`/search?lang=in&q=${query}&page=1`]);
  },
  async fetchDetail(bookId: string) {
    const { data } = await api.get(`${BASE}/drama/${bookId}?lang=in`);
    const detail = data?.data || data?.results || data;
    return normalizeDrama(detail);
  },
  async fetchVideoUrl(episodeId: string, bookId?: string) {
    if (!bookId) return '';
    const { data } = await api.get(`${BASE}/watch/${bookId}/${episodeId}?lang=in&code=${API_CODE}`);
    if (typeof data === 'string') return data;
    return (
      data?.data?.playUrl ||
      data?.data?.url ||
      data?.data?.videoUrl ||
      data?.data?.m3u8 ||
      data?.data?.play_url ||
      data?.playUrl ||
      data?.url ||
      data?.videoUrl ||
      data?.m3u8 ||
      data?.results?.url ||
      ''
    );
  },
  async fetchEpisodes(bookId: string): Promise<Episode[]> {
    const { data } = await api.get(`${BASE}/drama/${bookId}?lang=in`);
    const payload = data?.data || data;
    const explicitList =
      payload?.videos ||
      payload?.episode_list ||
      payload?.episodes ||
      payload?.videoList ||
      payload?.shortPlayVideoInfos ||
      payload?.contentInfos ||
      [];

    const deepCandidates = collectEpisodeCandidatesDeep(payload);
    const sourceList = Array.isArray(explicitList) && explicitList.length > 0 ? explicitList : deepCandidates;

    let episodes = sourceList.map((ep: any, index: number) => {
      const episodeNo = episodeNumberFromItem(ep, index);
      return {
        ...ep,
        id: String(episodeNo),
        title: ep.title || ep.name || ep.episodeName || ep.shortPlayName || `Episode ${episodeNo}`,
        duration: normalizeDuration(ep.duration || ep.videoDuration || ep.timeLength),
        url: `${BASE}/watch/${bookId}/${episodeNo}?lang=in&code=${API_CODE}`,
      };
    });

    episodes = dedupeEpisodes(episodes).sort((a, b) => Number(a.id) - Number(b.id));
    if (episodes.length > 0) return episodes;

    const totalEpisode =
      Number(payload?.episodeCount) ||
      Number(payload?.episodeTotal) ||
      Number(payload?.totalEpisode) ||
      Number(payload?.totalEpisodes) ||
      Number(payload?.shortPlayEpisodeCount) ||
      Number(payload?.shortPlayCount) ||
      Number(payload?.dramaInfo?.episodeCount) ||
      0;

    if (!Number.isFinite(totalEpisode) || totalEpisode <= 0) return [];

    const capped = Math.min(totalEpisode, 200);
    return Array.from({ length: capped }, (_, i) => {
      const epNo = i + 1;
      return {
        id: String(epNo),
        title: `Episode ${epNo}`,
        duration: normalizeDuration(undefined),
        url: `${BASE}/watch/${bookId}/${epNo}?lang=in&code=${API_CODE}`,
      };
    });
  },
};


