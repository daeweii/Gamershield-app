// Global search over working tools and top-level sections.
// Planned tools are left out so search never leads to something that doesn't work yet.

import { READY_TOOLS, SECTIONS, findCategory, type Section, type Tool } from './registry.ts';

export type SearchResult =
  | { kind: 'tool'; item: Tool; score: number }
  | { kind: 'section'; item: Section; score: number };

const normalize = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();

/** Higher is better. 0 means no match. Every word in the query must match somewhere. */
function scoreFields(query: string, name: string, keywords: string[], summary: string, extra = ''): number {
  const n = normalize(name);
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  let total = 0;
  for (const word of words) {
    let best = 0;
    if (n === word) best = 100;
    else if (n.startsWith(word)) best = 80;
    else if (n.split(/\s+/).some((part) => part.startsWith(word))) best = 70;
    else if (n.includes(word)) best = 60;
    else if (keywords.some((k) => normalize(k) === word)) best = 55;
    else if (keywords.some((k) => normalize(k).startsWith(word))) best = 45;
    else if (normalize(extra).includes(word)) best = 30;
    else if (normalize(summary).includes(word)) best = 20;
    if (!best) return 0;
    total += best;
  }
  return total;
}

export function searchPlatform(query: string, limit = 12): SearchResult[] {
  const results: SearchResult[] = [];
  for (const tool of READY_TOOLS) {
    const score = scoreFields(query, tool.name, tool.keywords, tool.summary, findCategory(tool.category)?.name);
    if (score) results.push({ kind: 'tool', item: tool, score: score + 5 });
  }
  for (const section of SECTIONS) {
    const score = scoreFields(query, section.name, [], section.summary);
    if (score) results.push({ kind: 'section', item: section, score });
  }
  return results.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).slice(0, limit);
}
