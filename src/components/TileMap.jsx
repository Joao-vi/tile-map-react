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

const addTileColor = "#16db65";
const removeTileColor = "#ef233c";
const selectedBorder = "#13aa4f";
const padding = 2;
const tileSize = 32;

export const TileMap = (props) => {
  const { selectedColor, layers, handlePopup } = props;
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
          ctx.current.fillStyle = "#3d3a46";
          ctx.current.fillRect(
            i * tileSize,
            j * tileSize,
            tileSize - padding,
            tileSize - padding
          );
        }
      }
    }
  }, []);

  const paintTile = (props) => {
    const { x = 0, px = 0, y = 0, py = 0, wx = padding, hy = padding } = props;

    ctx.current.beginPath();
    ctx.current.fillRect(
      x * tileSize - px,
      y * tileSize - py,
      tileSize - wx,
      tileSize - hy
    );
    ctx.current.closePath();
  };

  const generateTiles = useCallback((layer, index) => {
    layer.forEach(({ x, y, color, owner }) => {
      const sameOwnerX = layer?.some(
        (tile) => tile.x === x - 1 && tile.y === y && tile.owner === owner
      );

      const sameOwnerY = layer?.some(
        (tile) => tile.y === y - 1 && tile.x === x && tile.owner === owner
      );

      ctx.current.fillStyle = color;

      if (sameOwnerX && sameOwnerY) {
        paintTile({ x, px: 2, y, py: 2, wx: 0, hy: 0 });
      } else if (sameOwnerX) {
        paintTile({ x, px: 2, y, wx: 0 });
      } else if (sameOwnerY) {
        paintTile({ x, y, py: 2, hy: 0 });
      } else {
        paintTile({ x, y });
      }

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
          ctx.current.rect(x * tileSize - 1, y * tileSize, tileSize - 1, 1);
          ctx.current.stroke();
          ctx.current.closePath();
        }

        if (isLeft) {
          ctx.current.beginPath();
          ctx.current.rect(
            x * tileSize - 1,
            y * tileSize,
            1,
            tileSize - padding
          );
          ctx.current.stroke();
          ctx.current.closePath();
        }

        if (isBottom) {
          ctx.current.beginPath();
          ctx.current.rect(
            x * tileSize - 1,
            y * tileSize + tileSize - 3,
            tileSize - 1,
            1
          );
          ctx.current.stroke();
          ctx.current.closePath();
        }

        if (isRight) {
          ctx.current.beginPath();
          ctx.current.rect(
            x * tileSize + tileSize - 3,
            y * tileSize,
            1,
            tileSize - padding
          );
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

    return xCoord <= 0 ||
      yCoord > 33 ||
      yCoord <= 0 ||
      xCoord > 33 ||
      (xCoord >= 33 && yCoord >= 9)
      ? null
      : [xCoord, yCoord];
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
          // allow wheel-zoom only if altKey is down. Otherwise - ignore
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
        } else if (x > 5) {
          e.moveTo(5, y);
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

    draw();
  }, [draw]);

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
            const tileNumber = (x - 1) * 31 + y;
            layers[2].push({ tileNumber, x, y, color: selectedColor });
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

      ctx.current.fillStyle = "rgba(226, 224, 224, 0.2)";
      ctx.current.beginPath();
      ctx.current.rect(
        x * tileSize - 1,
        y * tileSize - 1,
        tileSize - padding,
        tileSize - padding
      );
      ctx.current.stroke();
      ctx.current.fill();
      ctx.current.closePath();
    };

    const handleMouseDown = (e) => {
      if (!e.ctrlKey) {
        const [x, y] = getCoords(e);
        const shiftKey = e.shiftKey;
        addTile(x, y, shiftKey);
        isMouseDown.current = true;
      }
      if (e.ctrlKey) canvasEl.style.cursor = "grabbing";
    };

    const handleMouseUp = (e) => {
      isMouseDown.current = false;
      if (e.ctrlKey) canvasEl.style.cursor = "grab";
    };

    const handleMouseLeave = () => (isMouseDown.current = false);

    let isOpen = false;
    let lastCoord = null;

    const handleMouseMove = (e) => {
      var coord = getCoords(e);
      var shiftKey = e.shiftKey;

      if (!!coord) {
        const [x, y] = coord;

        if (isOpen && (lastCoord[0] !== x || lastCoord[1] !== y)) {
          isOpen = false;
          handlePopup({ isOpen });
        }

        if (isMouseDown.current) {
          addTile(x, y, shiftKey);
        }

        hover(x, y, shiftKey);
      }
    };

    const handleCallPopup = (e) => {
      isOpen = true;
      let coords = getCoords(e);
      if (!!coords) {
        const [x, y] = coords;
        lastCoord = [x, y];

        const top = y * 32 + offsetMap.current.top + 20;
        const left = x * 32 + offsetMap.current.left + 20;
        handlePopup({
          isOpen,
          x,
          y,
          top,
          left,
        });
      }
    };

    canvasEl.addEventListener("mousedown", handleMouseDown);

    canvasEl.addEventListener("mouseup", handleMouseUp);

    canvasEl.addEventListener("mouseleave", handleMouseLeave);

    canvasEl.addEventListener("mousemove", debounce(handleCallPopup, 500));
    canvasEl.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvasEl.removeEventListener("mousedown", handleMouseDown);
      canvasEl.removeEventListener("mouseup", handleMouseUp);
      canvasEl.removeEventListener("mouseleave", handleMouseLeave);
      canvasEl.removeEventListener("mousemove", handleMouseMove);
    };
  }, [canvas, draw, selectedColor, layers, handlePopup]);

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
