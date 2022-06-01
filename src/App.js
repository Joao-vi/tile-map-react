import { useEffect, useState } from "react";
import styled from "styled-components";

import { Colors } from "./components/Colors";
import { TileMap } from "./components/TileMap";

import { fetchTiles } from "./fetchTiles";

export const Wrapper = styled.main`
  padding: 50px 0;
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const pallet = {
  name: "pallet-colors",
  colors: [
    { id: "#264653" },
    { id: "#2a9d8f" },
    { id: "#e9c46a" },
    { id: "#f4a261" },
    { id: "#e76f51" },
  ],
};

function App() {
  const [selected, setSelected] = useState(pallet.colors[0].id);
  const [tiles, setTiles] = useState([]);
  useEffect(() => {
    fetchTiles().then((tiles) => setTiles(tiles));
  }, []);

  return (
    <Wrapper>
      <Colors pallet={pallet} selected={selected} setSelected={setSelected} />
      <TileMap tiles={tiles} selectedColor={selected} />
    </Wrapper>
  );
}

export default App;
