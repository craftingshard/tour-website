// src/utils/filter.ts

import { badWords } from '../constants/bad-words';

const escapeRegExp = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildBadWordsRegex = (() => {
  let cached: RegExp | null = null;
  return () => {
    if (cached) return cached;
    // Sort by length desc to prefer longer phrases first
    const parts = [...badWords]
      .filter(Boolean)
      .map(w => escapeRegExp(String(w).trim()))
      .sort((a, b) => b.length - a.length);
    cached = new RegExp(`(${parts.join('|')})`, 'gi');
    return cached;
  };
})();

export function filterBadWords(comment: string): string {
  if (!comment || typeof comment !== 'string') return '';
  const regex = buildBadWordsRegex();
  return comment.replace(regex, (match) => '*'.repeat(match.length));
}

export function hasBadWords(comment: string): boolean {
  if (!comment || typeof comment !== 'string') return false;
  const regex = buildBadWordsRegex();
  return regex.test(comment);
}

export function getBadWords(comment: string): string[] {
  if (!comment || typeof comment !== 'string') return [];
  const regex = buildBadWordsRegex();
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = regex.exec(comment)) !== null) {
    if (m[1]) found.add(m[1]);
  }
  return Array.from(found);
}