import { generateArray } from "./generateArray";

import { pallet } from "./App";

export const fetchTiles = async () => {
  function getRandom(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const tiles = generateArray(50).map((tile, index) => {
    const color = pallet.colors[getRandom(0, 4)].id;
    return {
      tile: tile + index,
      color,
    };
  });

  const fResponse = tiles.map(({ tile, color }) => {
    const mapNumber = Math.floor(tile / 1000 - 0.0001);
    const offSetTiles = mapNumber * 1000;

    const x = Math.floor((tile - offSetTiles) / 33 - 0.01) + 1;
    const y = tile - offSetTiles - (x - 1) * 33;

    return {
      tile: tile,
      x: x,
      y: y,
      color,
    };
  });

  console.log(fResponse);

  return fResponse;
};
