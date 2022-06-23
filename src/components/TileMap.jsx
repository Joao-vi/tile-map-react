import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import panzoom from "panzoom";
import debounce from "lodash/debounce";

const Wrapper = styled.div`
  position: relative;
  max-width: 1408px;
  width: 100%;
  height: 500px;

  margin: 0 auto;

  background-color: #201c1c;
  overflow: hidden;

  border-radius: 10px;

  &:focus-visible {
    outline: none;
  }
`;

const Panzoom = styled.div``;

const Actions = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  justify-items: center;

  > button {
    all: none;
  }
`;

const map = {
  width: 1408,
  height: 928,
  tileSize: 32,
  addColor: "#2ee979",
  removeColor: "#ea4b5d",
  selectColor: "#13aa4f",
  alreadyPlantedColor: "#432818",
  alreadyPlantedColor1: "#3f26161d",
};

const background = new Image();
background.src = "/assets/test/background.png";

const ground = new Image();
ground.src = "/assets/test/ground.png";

const tree1 = new Image();
tree1.src = "/assets/test/tree-age-1.png";

const tree2 = new Image();
tree2.src = "/assets/test/tree-age-2.png";

const tree3 = new Image();
tree3.src = "/assets/test/tree-age-3.png";

const tree = {
  1: tree1,
  2: tree2,
  3: tree3,
};

let canvas;
let ctx;
let isMouseDown = false;
let offsetMap = {
  top: 0,
  left: 0,
};
let isAdding = true;
let panzoomInstance;

export const TileMap = (props) => {
  const {
    selectedColor,
    layers,
    setPopup,
    isFetching,
    children,
    onSelectTiles,
    userName,
  } = props;
  const [isVisible, setIsVisible] = useState(false);

  const generateBackground = useCallback(() => {
    ctx.drawImage(background, 0, 0, map.width, map.height);
  }, []);

  const paintTile = (props) => {
    const { x = 0, y = 0, age } = props;

    const currentTree = tree[age];
    ctx.drawImage(currentTree, x * 32, y * 32);
  };

  const generateTiles = useCallback(
    (layer, index) => {
      layer.forEach(({ x, y, age, owner }) => {
        paintTile({ x, y, age });

        if (index === 1 && isVisible) {
          const isTop = layer?.some(
            (tile) =>
              tile.x === x && tile.y === y - 1 && tile.owner === userName
          );

          const isLeft = layer?.some(
            (tile) =>
              tile.x === x - 1 && tile.y === y && tile.owner === userName
          );

          const isBottom = layer?.some(
            (tile) =>
              tile.x === x && tile.y === y + 1 && tile.owner === userName
          );

          const isRight = layer?.some(
            (tile) =>
              tile.x === x + 1 && tile.y === y && tile.owner === userName
          );

          ctx.strokeStyle = map.alreadyPlantedColor;
          ctx.lineJoin = "round";
          ctx.fillStyle = map.alreadyPlantedColor1;

          if (!isTop && owner === userName) {
            ctx.beginPath();
            ctx.rect(x * map.tileSize, y * map.tileSize, map.tileSize, 1);
            ctx.stroke();
            ctx.closePath();
            ctx.fillRect(x * map.tileSize, y * map.tileSize, 32, 32);
          }

          if (!isLeft && owner === userName) {
            ctx.beginPath();
            ctx.rect(x * map.tileSize, y * map.tileSize, 1, map.tileSize);
            ctx.stroke();
            ctx.closePath();
            ctx.fillRect(x * map.tileSize, y * map.tileSize, 32, 32);
          }

          if (!isBottom && owner === userName) {
            ctx.beginPath();
            ctx.rect(x * map.tileSize, (y + 1) * map.tileSize, map.tileSize, 1);
            ctx.stroke();
            ctx.closePath();
            ctx.fillRect(x * map.tileSize, y * map.tileSize, 32, 32);
          }

          if (!isRight && owner === userName) {
            ctx.beginPath();
            ctx.rect(
              x * map.tileSize + map.tileSize,
              y * map.tileSize,
              1,
              map.tileSize
            );
            ctx.stroke();
            ctx.closePath();
            ctx.fillRect(x * map.tileSize, y * map.tileSize, 32, 32);
          }
        }

        if (index === 2) {
          const isTop = !layer?.some(
            (tile) => tile.x === x && tile.y === y - 1
          );

          const isLeft = !layer?.some(
            (tile) => tile.x === x - 1 && tile.y === y
          );

          const isBottom = !layer?.some(
            (tile) => tile.x === x && tile.y === y + 1
          );

          const isRight = !layer?.some(
            (tile) => tile.x === x + 1 && tile.y === y
          );

          ctx.strokeStyle = map.selectColor;

          if (isTop) {
            ctx.beginPath();
            ctx.rect(x * map.tileSize, y * map.tileSize, map.tileSize, 1);
            ctx.stroke();
            ctx.closePath();
          }

          if (isLeft) {
            ctx.beginPath();
            ctx.rect(x * map.tileSize, y * map.tileSize, 1, map.tileSize);
            ctx.stroke();
            ctx.closePath();
          }

          if (isBottom) {
            ctx.beginPath();
            ctx.rect(
              x * map.tileSize,
              y * map.tileSize + map.tileSize,
              map.tileSize,
              1
            );
            ctx.stroke();
            ctx.closePath();
          }

          if (isRight) {
            ctx.beginPath();
            ctx.rect(
              x * map.tileSize + map.tileSize,
              y * map.tileSize,
              1,
              map.tileSize
            );
            ctx.stroke();
            ctx.closePath();
          }
        }
      });
    },
    [userName, isVisible]
  );

  const draw = useCallback(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer, index) => {
      if (index === 0) {
        generateBackground();
      } else {
        generateTiles(layer, index);
      }
    });
  }, [generateBackground, generateTiles, layers]);

  const getCoords = (e) => {
    const { x, y } = e.target.getBoundingClientRect();
    const mouseX = e.clientX - x;
    const mouseY = e.clientY - y;
    const xCoord = Math.floor(mouseX / map.tileSize);
    const yCoord = Math.floor(mouseY / map.tileSize);

    if (xCoord <= 1 || xCoord >= 42 || yCoord <= 1 || yCoord >= 27) {
      return null;
    }

    return { xCoord, yCoord };
  };

  useEffect(() => {
    const elPanzoom = document.getElementById("panzoom");
    if (!elPanzoom) {
      throw new Error("Panzoom element was not found.");
    }

    panzoomInstance = panzoom(elPanzoom, {
      zoomDoubleClickSpeed: 1,
      smoothScroll: false,
      maxZoom: 1,
      minZoom: 1,
      beforeWheel: () => true,
      beforeMouseDown: (e) => {
        var shouldIgnore = !e.ctrlKey;
        return shouldIgnore;
      },
      filterKey: () => true,
    });

    panzoomInstance.on("pan", (e) => {
      const offSetCanvas = map.width - window.innerWidth + 32 - 20;
      const maxPanX = offSetCanvas < 0 ? 0 : offSetCanvas * -1;
      const maxPanY = (map.height - 500) * -1;

      const { x, y } = e.getTransform();

      offsetMap = { top: y, left: x };
      if (x < maxPanX) {
        e.moveTo(maxPanX, y);
      } else if (x > 0) {
        e.moveTo(0, y);
      }

      if (y < maxPanY) {
        e.moveTo(x, maxPanY);
      } else if (y > 0) {
        e.moveTo(x, 0);
      }
    });
  }, []);

  useEffect(() => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    if (!canvas || !ctx) {
      throw new Error("Html canvas tag was not found.");
    }

    canvas.width = map.width;
    canvas.height = map.height;
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = map.addColor;

    background.onload = () => draw();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [isFetching, draw]);

  useEffect(() => {
    const changeCursor = (e) => {
      if (e.ctrlKey) {
        canvas.style.cursor = "grab";
      } else {
        canvas.style.cursor = "default";
      }
      isAdding = !e.shiftKey;
    };

    window.addEventListener("keydown", changeCursor);
    window.addEventListener("keyup", changeCursor);
    return () => {
      window.removeEventListener("keydown", changeCursor);
      window.removeEventListener("keyup", changeCursor);
    };
  }, []);

  useEffect(() => {
    const popup = {
      isOpen: false,
      lastCoord: {
        x: 0,
        y: 0,
      },
    };

    const handleCallPopup = (e) => {
      if (e.ctrlKey || e.shiftKey || isMouseDown) {
        return;
      }

      popup.isOpen = true;
      let coords = getCoords(e);

      if (!!coords) {
        const { xCoord, yCoord } = coords;
        popup.lastCoord = {
          x: xCoord,
          y: yCoord,
        };

        const tileNumber = (yCoord - 2) * 40 + xCoord - 1;

        const top = yCoord * 32 + offsetMap.top + 20;
        const left = xCoord * 32 + offsetMap.left + 20;

        const hoveredTile =
          layers[2].find((tile) => tile.x === xCoord && tile.y === yCoord) ||
          layers[1].find((tile) => tile.x === xCoord && tile.y === yCoord);

        setPopup({
          isOpen: popup.isOpen,
          top,
          left,
          tileNumber: hoveredTile?.tileNumber || tileNumber,
          age: hoveredTile?.age,
          owner: hoveredTile?.owner,
        });
      } else {
        popup.isOpen = false;
      }
    };
    const handleShowPopup = debounce(handleCallPopup, 500);

    const addTile = (x, y) => {
      const shouldPaint = !layers[1].some(
        (tile) => tile.x === x && tile.y === y
      );

      if (shouldPaint) {
        const tileNumber = (y - 2) * 40 + x - 1;
        const age = selectedColor;
        onSelectTiles({ x, y, tileNumber, age }, isAdding);

        draw();
      }
    };

    const hover = (x, y) => {
      draw();

      if (isAdding) {
        ctx.strokeStyle = map.addColor;
      } else {
        ctx.strokeStyle = map.removeColor;
      }

      ctx.fillStyle = "rgba(226, 224, 224, 0.144)";
      ctx.beginPath();
      ctx.rect(x * map.tileSize, y * map.tileSize, map.tileSize, map.tileSize);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    };

    const handleMouseDown = (e) => {
      if (!e.ctrlKey) {
        const coords = getCoords(e);
        if (!!coords) {
          const { xCoord, yCoord } = coords;
          addTile(xCoord, yCoord);
          isMouseDown = true;
        }
      }

      if (e.ctrlKey) canvas.style.cursor = "grabbing";
    };

    const handleMouseUp = (e) => {
      isMouseDown = false;
      if (e.ctrlKey) canvas.style.cursor = "grab";
    };

    const handleMouseLeave = (e) => {
      isMouseDown = false;
      popup.isOpen = false;
      setPopup({ isOpen: false });
      draw();
      handleShowPopup.cancel();
    };

    const handleMouseMove = (e) => {
      var coord = getCoords(e);

      if (!!coord) {
        const { xCoord, yCoord } = coord;

        if (
          popup.isOpen &&
          (popup.lastCoord.x !== xCoord || popup.lastCoord.y !== yCoord)
        ) {
          popup.isOpen = false;
          setPopup({ isOpen: popup.isOpen });
          handleShowPopup.cancel();
        }

        if (isMouseDown) {
          addTile(xCoord, yCoord);
        }

        hover(xCoord, yCoord);
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);

    canvas.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("mouseleave", handleMouseLeave);

    canvas.addEventListener("mousemove", handleShowPopup);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [draw, selectedColor, layers, setPopup, userName, onSelectTiles]);

  return (
    <div style={{ width: "100%", padding: "0 10px" }}>
      <Actions>
        <button onClick={() => panzoomInstance?.pause()}>
          Disable panning
        </button>
        <button onClick={() => panzoomInstance?.resume()}>
          Enable panning
        </button>

        <button onClick={() => setIsVisible((state) => !state)}>
          {isVisible ? "Hide" : "Show"}
        </button>

        <button onClick={() => (isAdding = true)}>Add Tile</button>
        <button onClick={() => (isAdding = false)}>Delete Tile</button>
      </Actions>

      <Wrapper>
        {children}
        <Panzoom id="panzoom">
          <canvas
            id="canvas"
            style={{
              position: "relative",
              display: "block",
              width: "min-content",
            }}
          ></canvas>
        </Panzoom>
      </Wrapper>
    </div>
  );
};
