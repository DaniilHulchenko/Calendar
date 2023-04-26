import { MouseEventHandler } from "react";
import Circle from "./Circle";

const AvatarCircle = ({
  name,
  className,
  skeleton,
  onClick,
}: {
  name: string | null | undefined;
  className?: string;
  skeleton?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  const names = name?.split(" ");

  return (
    <Circle
      backgroundColor={stringToColor(name)}
      className={className}
      tooltip={name}
      onClick={onClick}
      skeleton={skeleton}
    >
      {names?.[0]?.[0]}
      {names?.[1]?.[0]}
    </Circle>
  );
};

export default AvatarCircle;

const stringToColor = (str: string | null | undefined) => {
  if (!str) {
    return "#CBD5E1";
  }

  let hash = 0;
  let i;

  for (i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }

  return color;
};
