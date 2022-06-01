import { rpc } from "./rpc";
import { getColorByRarity } from "./helper";

export const fetchTiles = async () => {
  const response = await rpc?.get_table_rows({
    json: true, // Get the response as json
    code: "oliveland111", // Contract that we target
    scope: "oliveland111", // Account that owns the data
    lower_bound: "",
    upper_bound: "",
    table: "coordinates", // Table name
    limit: 1000, // Maximum number of rows that we want to get
    reverse: false, // Optional: Get reversed data
  });

  const fResponse = response.rows.map((row) => ({
    tile: row.x,
    color: getColorByRarity(row.rarity),
    owner: row.user,
    x: row.x,
    y: row.y,
  }));

  return fResponse;
};
