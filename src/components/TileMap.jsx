import { useCallback, useEffect } from "react";
import { useRef } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  /* height: 500px; */
  height: 100%;
  /* background-color: #9d9494; */
  background-color: #181818;
  overflow: hidden;

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
  const { selectedColor, layers } = props;
  const canvas = useRef(null);
  const ctx = useRef(null);
  const isMouseDown = useRef(false);

  const generateBackground = useCallback(() => {
    for (let i = 1; i <= 33; i++) {
      for (let j = 1; j <= 33; j++) {
        const tileNumber = (i - 1) * 33 + j;
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

        if (isTop) {
          ctx.current.strokeStyle = selectedBorder;
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

    return xCoord <= 0 || yCoord <= 0 || (yCoord > 10 && xCoord >= 31)
      ? null
      : [xCoord, yCoord];
  };

  useEffect(() => {
    ctx.current = canvas.current.getContext("2d");

    canvas.current.width = 1024;
    canvas.current.height = 1024;
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
    const addTile = (e) => {
      var coord = getCoords(e);

      if (!!coord) {
        const [x, y] = coord;

        const shouldPaint = !layers[1].some(
          (tile) => tile.x === x && tile.y === y
        );
        if (shouldPaint) {
          if (e.shiftKey) {
            const index = layers[2]?.findIndex(
              (tile) => tile.x === x && tile.y === y
            );
            index !== -1 && layers[2]?.splice(index, 1);
          } else {
            if (!layers[2].some((tile) => tile.x === x && tile.y === y)) {
              layers[2].push({ x, y, color: selectedColor });
            }
          }
          draw();
        }
      }
    };

    const hover = (e) => {
      const coord = getCoords(e);

      if (!!coord) {
        const [x, y] = coord;

        draw();

        if (e.shiftKey) {
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
      }
    };

    const handleMouseDown = (e) => {
      if (!e.ctrlKey) {
        addTile(e);
        isMouseDown.current = true;
      }
      if (e.ctrlKey) canvasEl.style.cursor = "grabbing";
    };

    const handleMouseUp = (e) => {
      isMouseDown.current = false;
      if (e.ctrlKey) canvasEl.style.cursor = "grab";
    };

    const handleMouseLeave = () => (isMouseDown.current = false);

    const handleMouseMove = (e) => {
      if (isMouseDown.current) {
        addTile(e);
      }

      hover(e);
    };

    canvasEl.addEventListener("mousedown", handleMouseDown);

    canvasEl.addEventListener("mouseup", handleMouseUp);

    canvasEl.addEventListener("mouseleave", handleMouseLeave);

    canvasEl.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvasEl.removeEventListener("mousedown", handleMouseDown);
      canvasEl.removeEventListener("mouseup", handleMouseUp);
      canvasEl.removeEventListener("mouseleave", handleMouseLeave);
      canvasEl.removeEventListener("mousemove", handleMouseMove);
    };
  }, [canvas, draw, selectedColor, layers]);

  return (
    <Wrapper>
      <Panzoom>
        <canvas
          style={{ margin: "0 auto", display: "block", width: "min-content" }}
          ref={canvas}
        ></canvas>
      </Panzoom>
    </Wrapper>
  );
};
