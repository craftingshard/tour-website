// src/utils/filter.ts

import { badWords } from '../constants/bad-words.ts'; 

export function filterBadWords(comment: string): string {
  if (!comment || typeof comment !== 'string') {
    return '';
  }

  let filteredComment = comment;
  for (const word of badWords) {
    const regex = new RegExp(word, 'gi'); 
    const replacement = '*'.repeat(word.length);
    filteredComment = filteredComment.replace(regex, replacement);
  }

  return filteredComment;
}