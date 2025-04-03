// src/utils/matchOutfits.js
import { outfitMap } from "./outfitMap";

export const matchOutfitsFromCaption = (caption) => {
  const lower = caption.toLowerCase();
  const matches = [];

  for (const keyword in outfitMap) {
    if (lower.includes(keyword)) {
      matches.push({
        name: keyword,
        file: outfitMap[keyword],
      });
    }
  }

  return matches;
};
