import styled from "styled-components";

const Wrapper = styled.ul`
  display: flex;
  gap: 10px;
  align-items: center;

  list-style: none;
`;

const Tree = styled.img`
  cursor: pointer;

  width: 32px;
  height: 32px;
  border-radius: 5px;

  transition: all 300ms ease;
`;

const trees = [
  { src: "/assets/tiles-map/tree-age-1.png", value: 1 },
  {
    src: "/assets/tiles-map/tree-age-2.png",
    value: 2,
  },
  {
    src: "/assets/tiles-map/tree-age-3.png",
    value: 3,
  },
];

export const Trees = (props) => {
  const { setSelected, selected } = props;
  return (
    <Wrapper onChange={(e) => setSelected(e.target.id)}>
      {trees.map(({ src, value }) => (
        <Tree
          src={src}
          onClick={() => setSelected(value)}
          style={{ border: selected === value ? "1px solid #eeee" : "" }}
        />
      ))}
    </Wrapper>
  );
};
