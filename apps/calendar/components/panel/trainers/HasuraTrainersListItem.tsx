import ProfileAvatar from "components/layout/ProfileAvatar";
import { HasuraTrainer } from "loading/queries/hasura";
import TrainersListItem from "./TrainersListItem";

type HasuraTrainersListItemProps = {
  trainer: HasuraTrainer;
};

const HasuraTrainersListItem = ({ trainer }: HasuraTrainersListItemProps) => (
  <TrainersListItem
    circle={<ProfileAvatar url={trainer.profile?.avatar?.url} small />}
    title={trainer.profile?.name || trainer.profile?.user?.email}
    description={trainer.profile?.contact}
  />
);

export default HasuraTrainersListItem;
