const rarityColors = [
  { name: "Abundant", key: "abundant", color: "#B030EA" },
  { name: "Mythical", key: "mythical", color: "#ffe600" },
  { name: "Legendary", key: "legendary", color: "#2bff00" },
  { name: "Immortal", key: "immortal", color: "#ff008c" },
  { name: "Uncommon", key: "uncommon", color: "#24B208" },
  { name: "Ultra Rare", key: "ultrarare", color: "#C7A242" },
  { name: "Organic", key: "organic", color: "#5B5FFB" },
  { name: "Ecological", key: "ecological", color: "#FA3C3C" },
  { name: "Common", key: "common", color: "#C1336D" },
  { name: "Rare", key: "rare", color: "#EDEDED" },
  { name: "Any Rarity", key: "any", color: "#d4d4d4" },
];

export const getColorByRarity = (rarity) => {
  const findRarity = rarityColors.find(
    (item) => item.name.toLocaleLowerCase() === rarity.toLowerCase()
  );

  return findRarity?.color;
};
