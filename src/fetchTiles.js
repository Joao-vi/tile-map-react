import { generateArray } from "./generateArray";

export const fetchTiles = async () => {
  function getRandom(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const tiles = generateArray(900).map((tile, index) => {
    const age = getRandom(1, 3);
    return {
      tile: tile,
      age,
    };
  });

  const fResponse = tiles.map(({ tile, age }) => {
    const mapNumber = Math.floor(tile / 1000 - 0.0001);
    const offSetTiles = mapNumber * 1000;

    const x = Math.floor((tile - offSetTiles) / 40 - 0.01) + 1;
    const y = tile - offSetTiles - (x - 1) * 25;

    return {
      tile: tile,
      x: x,
      y: y,
      age,
    };
  });

  console.log(fResponse);
  return fResponse;
};
