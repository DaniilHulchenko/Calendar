import { MouseEventHandler } from "react";
import ProfileAvatar from "components/layout/ProfileAvatar";
import ListItem from "ui/layout/list/ListItem";
import { HasuraTrainer } from "loading/queries/hasura";

const TrainerListItem = ({
  trainer,
  skeleton,
  selected,
  onClick,
}: {
  trainer?: any;
  skeleton?: boolean;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <ListItem selected={selected} disabled={skeleton} onClick={onClick}>
      <div className="flex grow gap-4 p-4">
        <ProfileAvatar url={trainer?.profile?.avatar?.url} skeleton={skeleton} small />

        <div className="grow text-left">
          <div className="font-semibold">
            {skeleton ? (
              <div className="h-4 animate-pulse rounded bg-gray-200" />
            ) : (
              trainer?.profiles?.name || trainer?.profile?.name
            )}
          </div>

          <div className="text-xs text-gray-500">
            {skeleton ? (
              <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            ) : (
              trainer?.profiles?.user?.email ||
              trainer?.profiles?.contact ||
              trainer?.profile?.user?.email ||
              trainer?.profile?.contact
            )}
          </div>
        </div>
      </div>
    </ListItem>
  );
};
export default TrainerListItem;
