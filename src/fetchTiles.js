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

  /*
    First tile X: 2 and Y: 2
    last tile x: 41 and Y: 26
  */
  const fResponse = tiles.map(({ tile, age }) => {
    const mapNumber = Math.floor(tile / 1000 - 0.0001);
    const offSetTiles = mapNumber * 1000;

    // const x = Math.floor((tile - offSetTiles) / 40 - 0.01) + 2;
    // const y = tile - offSetTiles - (x - 2) * 25 + 1;

    const x = Math.floor((tile - offSetTiles) / 40 - 0.01) + 2;
    const y = tile - offSetTiles - (x - 2) * 40 + 1;

    return {
      tileNumber: tile,
      x: y,
      y: x,
      age,
    };
  });

  console.log(fResponse);
  return fResponse;
};
