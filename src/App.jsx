import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { Colors } from "./components/Colors";
import { TileMap } from "./components/TileMap";

import { fetchTiles } from "./fetchTiles";

export const Wrapper = styled.main`
  position: relative;
  padding: 50px 0;
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

export const Instructions = styled.div`
  display: flex;
  gap: 20px;
  color: #e8eddf;

  .key {
    color: #e76f51;
  }
`;

export const pallet = {
  name: "pallet-colors",
  colors: [
    { id: "#264653" },
    { id: "#2a9d8f" },
    { id: "#e9c46a" },
    { id: "#f4a261" },
    { id: "#e76f51" },
  ],
};

/*
  1. Background.
  2. Taken Tiles.
  3. Tiles selected by user.
*/
let layers = [[], [], []];

const Popup = styled.div`
  position: absolute;

  color: #e8eddf;
  background-color: #242423;
  border-radius: 10px;
  border: 1px solid #cfdbd5;
  padding: 10px 20px;
  z-index: 200000;

  > span {
    display: block;
    color: #c5c3c6;
    font-weight: bold;

    > span {
      color: #e8eddf;
      font-weight: 400;
    }
  }
`;

function App() {
  const [selected, setSelected] = useState(1);

  const [popup, setPopup] = useState({
    isOpen: false,
    top: null,
    left: null,
    tileNumber: null,
    age: null,
  });

  useEffect(() => {
    fetchTiles().then((tiles) => (layers[1] = tiles));
  }, []);

  const handleSetPopup = useCallback(
    ({ isOpen, top = 0, left = 0, age, tileNumber }) => {
      setPopup({ isOpen, top, left, age, tileNumber });
    },
    []
  );

  return (
    <Wrapper>
      <Colors pallet={pallet} selected={selected} setSelected={setSelected} />
      <Instructions>
        <span>
          Hold <span className="key">CTRL</span> to move map.
        </span>
        <span>
          Hold <span className="key">Shift</span> to delete a tile.
        </span>
      </Instructions>
      <div style={{ position: "relative" }}>
        {popup.isOpen && (
          <Popup
            style={{
              top: popup.top,
              left: popup.left,
            }}
          >
            <span>
              Tile Number: <span>{popup.tileNumber}</span>
            </span>

            {!!popup.age && (
              <span>
                age: <span>{popup.age}</span>
              </span>
            )}
          </Popup>
        )}
        <TileMap
          layers={layers}
          selectedColor={selected}
          setPopup={handleSetPopup}
        />
      </div>
    </Wrapper>
  );
}

export default App;
