import { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.ul`
  display: flex;
  gap: 10px;
  align-items: center;

  list-style: none;
`;

const Color = styled.label`
  cursor: pointer;
  width: 40px;
  height: 40px;

  border-radius: 10px;

  opacity: 0.5;

  transition: all 300ms ease;
  &:hover {
    opacity: 1;
  }

  > input {
    display: none;
  }
`;

export const Colors = (props) => {
  const { selected, setSelected, pallet } = props;
  return (
    <Wrapper onChange={(e) => setSelected(e.target.id)}>
      {pallet.colors.map(({ id }) => {
        const isChecked = id === selected;
        return (
          <Color
            key={id}
            htmlFor={id}
            style={{
              backgroundColor: id,
              border: isChecked ? "1px solid #eeee" : "",
              opacity: isChecked ? 1 : 0.5,
            }}
          >
            <input
              type="radio"
              id={id}
              name={pallet.name}
              checked={isChecked}
            />
          </Color>
        );
      })}
    </Wrapper>
  );
};
