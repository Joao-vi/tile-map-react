import styled from "styled-components";

const Wrapper = styled.ul`
  display: flex;
  gap: 10px;
  align-items: center;

  list-style: none;
`;

const Tree = styled.img`
  width: 32px;
  height: 32px;
`;

export const Colors = (props) => {
  const { setSelected } = props;
  return (
    <Wrapper onChange={(e) => setSelected(e.target.id)}>
      <Tree
        src="/assets/tiles-map/tree-age-1.png"
        onClick={() => setSelected(1)}
      />
      <Tree
        src="/assets/tiles-map/tree-age-2.png"
        onClick={() => setSelected(2)}
      />
      <Tree
        src="/assets/tiles-map/tree-age-3.png"
        onClick={() => setSelected(3)}
      />
    </Wrapper>
  );
};
