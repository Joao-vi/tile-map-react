import React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { Trees } from "./components/Trees";
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

/*
  0. Background.
  1. Taken Tiles.
  2. Tiles selected by user.
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
  const [isFetching, setIsFecthing] = useState(false);

  const [popup, setPopup] = useState({
    isOpen: false,
  });

  useEffect(() => {
    setIsFecthing(true);
    fetchTiles().then((tiles) => {
      setIsFecthing(false);
      return (layers[1] = tiles);
    });
  }, []);

  return (
    <Wrapper>
      <Trees selected={selected} setSelected={setSelected} />

      <Instructions>
        <span>
          Hold <span className="key">CTRL</span> to move map.
        </span>
        <span>
          Hold <span className="key">Shift</span> to delete a tile.
        </span>
      </Instructions>

      <TileMap
        isFetching={isFetching}
        layers={layers}
        selectedColor={selected}
        setPopup={setPopup}
      >
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
      </TileMap>
    </Wrapper>
  );
}

export default App;
