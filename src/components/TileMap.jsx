import { useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import styled from "styled-components";

import panzoom from "panzoom";
import { debounce } from "lodash";

const Wrapper = styled.div`
  width: 100%;
  height: 500px;

  background-color: #201c1c;
  overflow: hidden;

  border-radius: 10px;

  &:focus-visible {
    outline: none;
  }
`;

const Panzoom = styled.div``;

const addTileColor = "#2ee979";
const removeTileColor = "#ea4b5d";
const selectedBorder = "#13aa4f";
const tileSize = 32;

const ground = new Image();
ground.src = "/assets/tiles-map/ground.png";

const tree1 = new Image();
tree1.src = "/assets/tiles-map/tree-age-1.png";

const tree2 = new Image();
tree2.src = "/assets/tiles-map/tree-age-2.png";

const tree3 = new Image();
tree3.src = "/assets/tiles-map/tree-age-3.png";

const tree = {
  1: tree1,
  2: tree2,
  3: tree3,
};

export const TileMap = (props) => {
  const { selectedColor, layers, setPopup, isFetching } = props;
  const canvas = useRef(null);
  const ctx = useRef(null);
  const isMouseDown = useRef(false);
  const [elPanzoom, setElPanzoom] = useState(null);
  const offsetMap = useRef({ top: 0, left: 0 });

  const generateBackground = useCallback(() => {
    for (let i = 1; i <= 33; i++) {
      for (let j = 1; j <= 33; j++) {
        const tileNumber = (i - 1) * 31 + j;
        if (tileNumber <= 1000) {
          ctx.current.drawImage(ground, i * tileSize, j * tileSize);
        }
      }
    }
  }, []);

  const paintTile = (props) => {
    const { x = 0, y = 0, age } = props;

    const currentTree = tree[age];
    ctx.current.drawImage(currentTree, x * 32, y * 32);
  };

  const generateTiles = useCallback((layer, index) => {
    layer.forEach(({ x, y, age }) => {
      paintTile({ x, y, age });

      if (index === 2) {
        const isTop = !layer?.some((tile) => tile.x === x && tile.y === y - 1);

        const isLeft = !layer?.some((tile) => tile.x === x - 1 && tile.y === y);

        const isBottom = !layer?.some(
          (tile) => tile.x === x && tile.y === y + 1
        );

        const isRight = !layer?.some(
          (tile) => tile.x === x + 1 && tile.y === y
        );

        ctx.current.strokeStyle = selectedBorder;
        if (isTop) {
          ctx.current.beginPath();
          ctx.current.rect(x * tileSize, y * tileSize, tileSize, 1);
          ctx.current.stroke();
          ctx.current.closePath();
        }

        if (isLeft) {
          ctx.current.beginPath();
          ctx.current.rect(x * tileSize, y * tileSize, 1, tileSize);
          ctx.current.stroke();
          ctx.current.closePath();
        }

        if (isBottom) {
          ctx.current.beginPath();
          ctx.current.rect(x * tileSize, y * tileSize + tileSize, tileSize, 1);
          ctx.current.stroke();
          ctx.current.closePath();
        }

        if (isRight) {
          ctx.current.beginPath();
          ctx.current.rect(x * tileSize + tileSize, y * tileSize, 1, tileSize);
          ctx.current.stroke();
          ctx.current.closePath();
        }
      }
    });
  }, []);

  const draw = useCallback(() => {
    ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

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
    const xCoord = Math.floor(mouseX / tileSize);
    const yCoord = Math.floor(mouseY / tileSize);

    const isOutside =
      xCoord <= 0 ||
      xCoord > 33 ||
      yCoord > 33 ||
      yCoord <= 0 ||
      (xCoord >= 33 && yCoord >= 9);

    return isOutside ? null : { xCoord, yCoord };
  };

  useEffect(() => {
    if (!!elPanzoom) {
      const instance = panzoom(elPanzoom, {
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

      const offSetCanvas = 1024 - window.innerWidth + 32;
      const maxPanX = offSetCanvas < 0 ? 0 : offSetCanvas * -1;

      instance.on("pan", function (e) {
        const { x, y } = e.getTransform();

        offsetMap.current = { top: y, left: x };
        if (x < maxPanX) {
          e.moveTo(maxPanX, y);
        } else if (x > 0) {
          e.moveTo(0, y);
        }

        if (y < -600) {
          e.moveTo(x, -600);
        } else if (y > 5) {
          e.moveTo(x, 5);
        }
      });
    }
  }, [elPanzoom]);

  useEffect(() => {
    ctx.current = canvas.current.getContext("2d");

    canvas.current.width = 1096;
    canvas.current.height = 1096;
    ctx.current.lineJoin = "round";
    ctx.current.lineWidth = 4;
    ctx.current.strokeStyle = addTileColor;

    ground.onload = () => draw();
  }, [draw]);

  useEffect(() => {
    draw();
    console.log("Effect");
  }, [isFetching, draw]);

  useEffect(() => {
    const changeCursor = (e) => {
      if (e.ctrlKey) {
        canvas.current.style.cursor = "grab";
      } else {
        canvas.current.style.cursor = "default";
      }
    };

    window.addEventListener("keydown", changeCursor);
    window.addEventListener("keyup", changeCursor);

    return () => {
      window.removeEventListener("keydown", changeCursor);
      window.removeEventListener("keyup", changeCursor);
    };
  }, []);

  useEffect(() => {
    const canvasEl = canvas.current;
    const popup = {
      isOpen: false,
      lastCoord: null,
    };

    const handleCallPopup = (e) => {
      if (e.ctrlKey || e.shiftKey) {
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
        const tile = (xCoord - 1) * 31 + yCoord;

        const top = yCoord * 32 + offsetMap.current.top + 20;
        const left = xCoord * 32 + offsetMap.current.left + 20;

        const hoveredTile =
          layers[2].find((tile) => tile.x === xCoord && tile.y === yCoord) ||
          layers[1].find((tile) => tile.x === xCoord && tile.y === yCoord);

        setPopup({
          isOpen: popup.isOpen,
          top,
          left,
          tileNumber: tile,
          age: hoveredTile?.age,
        });
      } else {
        popup.isOpen = false;
      }
    };
    const handleShowPopup = debounce(handleCallPopup, 500);

    const addTile = (x, y, shiftKey) => {
      const shouldPaint = !layers[1].some(
        (tile) => tile.x === x && tile.y === y
      );

      if (shouldPaint) {
        if (shiftKey) {
          const index = layers[2]?.findIndex(
            (tile) => tile.x === x && tile.y === y
          );
          index !== -1 && layers[2]?.splice(index, 1);
        } else {
          if (!layers[2].some((tile) => tile.x === x && tile.y === y)) {
            const tile = (x - 1) * 31 + y;
            layers[2].push({ tile, x, y, age: selectedColor });
          }
        }
        draw();
      }
    };

    const hover = (x, y, shiftKey) => {
      draw();

      if (shiftKey) {
        ctx.current.strokeStyle = removeTileColor;
      } else {
        ctx.current.strokeStyle = addTileColor;
      }

      ctx.current.fillStyle = "rgba(226, 224, 224, 0.144)";
      ctx.current.beginPath();
      ctx.current.rect(x * tileSize, y * tileSize, tileSize, tileSize);
      ctx.current.stroke();
      ctx.current.fill();
      ctx.current.closePath();
    };

    const handleMouseDown = (e) => {
      if (!e.ctrlKey) {
        const { xCoord, yCoord } = getCoords(e);
        const shiftKey = e.shiftKey;
        addTile(xCoord, yCoord, shiftKey);
        isMouseDown.current = true;
      }

      if (e.ctrlKey) canvasEl.style.cursor = "grabbing";
    };

    const handleMouseUp = (e) => {
      isMouseDown.current = false;
      if (e.ctrlKey) canvasEl.style.cursor = "grab";
    };

    const handleMouseLeave = (e) => {
      isMouseDown.current = false;
      popup.isOpen = false;
      setPopup({ isOpen: popup.isOpen });
      handleShowPopup.cancel();
      draw();
    };

    const handleMouseMove = (e) => {
      var coord = getCoords(e);
      var shiftKey = e.shiftKey;

      if (!!coord) {
        const { xCoord, yCoord } = coord;

        if (
          popup.isOpen &&
          (popup.lastCoord.x !== xCoord || popup.lastCoord.y !== yCoord)
        ) {
          popup.isOpen = false;
          setPopup({ isOpen: popup.isOpen });
        }

        if (isMouseDown.current) {
          addTile(xCoord, yCoord, shiftKey);
        }

        hover(xCoord, yCoord, shiftKey);
      }
    };

    canvasEl.addEventListener("mousedown", handleMouseDown);

    canvasEl.addEventListener("mouseup", handleMouseUp);

    canvasEl.addEventListener("mouseleave", handleMouseLeave);

    canvasEl.addEventListener("mousemove", handleShowPopup);
    canvasEl.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvasEl.removeEventListener("mousedown", handleMouseDown);
      canvasEl.removeEventListener("mouseup", handleMouseUp);
      canvasEl.removeEventListener("mouseleave", handleMouseLeave);
      canvasEl.removeEventListener("mousemove", handleMouseMove);
    };
  }, [canvas, draw, selectedColor, layers, setPopup]);

  return (
    <Wrapper>
      <Panzoom ref={setElPanzoom}>
        <canvas
          style={{
            position: "relative",
            margin: "0 auto",
            display: "block",
            width: "min-content",
          }}
          ref={canvas}
        ></canvas>
      </Panzoom>
    </Wrapper>
  );
};
