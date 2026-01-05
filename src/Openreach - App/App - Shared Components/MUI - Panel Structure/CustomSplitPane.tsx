import React, { useRef, useState } from "react";

interface CustomSplitPaneProps {
  split: "vertical" | "horizontal";
  sizes: [number, number];
  onChange: (sizes: [number, number]) => void;
  children: [React.ReactNode, React.ReactNode];
  minSize?: number;
  style?: React.CSSProperties;
}

export const CustomSplitPane: React.FC<CustomSplitPaneProps> = ({
  split,
  sizes,
  onChange,
  children,
  minSize = 50,
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [startSizes, setStartSizes] = useState<[number, number]>(sizes);

  const isVertical = split === "vertical";

  const handleDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStartPos(isVertical ? e.clientX : e.clientY);
    setStartSizes(sizes);
    document.body.style.cursor = isVertical ? "col-resize" : "row-resize";
  };

  const handleMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const total = isVertical ? rect.width : rect.height;
    const delta = (isVertical ? e.clientX : e.clientY) - startPos;
    let first = startSizes[0] + (delta / total) * 100;
    let second = 100 - first;
    if (first < (minSize / total) * 100) {
      first = (minSize / total) * 100;
      second = 100 - first;
    }
    if (second < (minSize / total) * 100) {
      second = (minSize / total) * 100;
      first = 100 - second;
    }
    onChange([first, second]);
  };

  const handleUp = () => {
    setDragging(false);
    document.body.style.cursor = "";
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      return () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };
    }
  }, [dragging]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: isVertical ? "row" : "column",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <div style={{ flexBasis: `${sizes[0]}%`, flexGrow: 0, flexShrink: 0, overflow: "hidden" }}>{children[0]}</div>
      <div
        style={{
          background: "#ccc",
          cursor: isVertical ? "col-resize" : "row-resize",
          width: isVertical ? 6 : "100%",
          height: isVertical ? "100%" : 6,
          zIndex: 10,
        }}
        onMouseDown={handleDown}
      />
      <div style={{ flexBasis: `${sizes[1]}%`, flexGrow: 0, flexShrink: 0, overflow: "hidden" }}>{children[1]}</div>
    </div>
  );
};
