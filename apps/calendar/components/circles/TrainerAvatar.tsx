import classNames from "classnames";
import AvatarCircle from "./AvatarCircle";

const TrainerAvatar = ({
  className,
  name,
  rejected,
  leader,
}: {
  className?: string;
  name: string | null | undefined;
  rejected?: boolean;
  leader?: boolean;
}) => (
  <AvatarCircle
    name={name}
    className={classNames(className, {
      "ring-red-500": rejected,
      "ring-indigo-500": leader && !rejected,
      "ring-gray-300": !rejected,
    })}
  />
);

export default TrainerAvatar;
