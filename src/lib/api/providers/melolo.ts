import api from '../client';
import { normalizeDrama, normalizeMeloloList } from '../normalizers';
import { API_CODE, Episode } from '../types';

const BASE = '/api/melolo';
const HOME_CACHE_TTL_MS = 30_000;

let meloloHomeCache: Record<number, { ts: number; data: any }> = {};

const normalizeDuration = (duration: any) => {
  if (typeof duration === 'number') {
    const mins = Math.floor(duration / 60);
    const secs = (duration % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
  if (duration) return duration;
  return '';
};

const getMeloloHome = async (page = 1) => {
  const now = Date.now();
  const cached = meloloHomeCache[page];
  if (cached && now - cached.ts < HOME_CACHE_TTL_MS) {
    return cached.data;
  }

  const { data } = await api.get(`${BASE}/home?lang=id&offset=${(page - 1) * 20}&code=${API_CODE}`);
  meloloHomeCache[page] = { ts: now, data };
  return data;
};

const getMeloloSections = (data: any): any[][] => {
  const sections = data?.data?.cell?.cell_data;
  if (!Array.isArray(sections)) return [];
  return sections
    .map((section: any) => (Array.isArray(section?.books) ? section.books : []))
    .filter((books: any[]) => books.length > 0);
};

const mapSection = (sections: any[][], sectionIndex: number) => {
  if (sections.length === 0) return [];
  const normalizedIndex = Math.max(0, Math.min(sectionIndex, sections.length - 1));
  return sections[normalizedIndex].map(normalizeDrama);
};

export const meloloProvider = {
  async fetchHomepage(page = 1) {
    const data = await getMeloloHome(page);
    return normalizeMeloloList(data);
  },
  async fetchTrending() {
    const data = await getMeloloHome(1);
    const sections = getMeloloSections(data);
    const row = mapSection(sections, 1);
    return row.length > 0 ? row : normalizeMeloloList(data);
  },
  async fetchLatest() {
    const data = await getMeloloHome(1);
    const sections = getMeloloSections(data);
    const row = mapSection(sections, 2);
    return row.length > 0 ? row : normalizeMeloloList(data);
  },
  async fetchForYou() {
    const data = await getMeloloHome(1);
    const sections = getMeloloSections(data);
    const row = mapSection(sections, 3);
    return row.length > 0 ? row : normalizeMeloloList(data);
  },
  async fetchVIP() {
    const data = await getMeloloHome(1);
    const sections = getMeloloSections(data);
    const row = mapSection(sections, 4);
    return row.length > 0 ? row : normalizeMeloloList(data);
  },
  async fetchDubIndo(page = 1, _classify?: string) {
    const data = await getMeloloHome(page);
    const sections = getMeloloSections(data);
    const row = mapSection(sections, 5);
    return row.length > 0 ? row : normalizeMeloloList(data);
  },
  async fetchRandom() {
    const data = await getMeloloHome(1);
    const list = normalizeMeloloList(data);
    return list.sort(() => Math.random() - 0.5);
  },
  async searchDrama(query: string) {
    const { data } = await api.get(`${BASE}/search?lang=id&q=${query}&code=${API_CODE}`);
    return normalizeMeloloList(data);
  },
  async fetchDetail(bookId: string) {
    const { data } = await api.get(`${BASE}/detail/${bookId}?lang=id&code=${API_CODE}`);
    const detail = data.data || data;
    return normalizeDrama(detail);
  },
  async fetchVideoUrl(episodeId: string, _bookId?: string) {
    const { data } = await api.get(`${BASE}/video/${episodeId}?lang=id&code=${API_CODE}`);
    return data.data || data.results || data.url || '';
  },
  async fetchEpisodes(bookId: string): Promise<Episode[]> {
    const { data } = await api.get(`${BASE}/detail/${bookId}?lang=id&code=${API_CODE}`);
    const list = data.videos || data.data?.episode_list || data.episode_list || [];

    return list.map((ep: any, index: number) => ({
      ...ep,
      id: String(ep.vid || ep.id || ep.episode_id || index + 1),
      title: ep.title || ep.name || `Episode ${ep.episode || index + 1}`,
      duration: normalizeDuration(ep.duration),
      url: `${BASE}/video/${ep.vid || ep.id || ep.episode_id}?lang=id&code=${API_CODE}`,
    }));
  },
};


