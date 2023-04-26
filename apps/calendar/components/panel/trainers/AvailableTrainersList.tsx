import { useHasuraAvailTrainersQuery } from "loading/queries/hasura";
import HasuraTrainersListItem from "./HasuraTrainersListItem";
import TrainersList from "./TrainersList";

const AvailableTrainersList = ({ date }: { date: number | Date }) => {
  const trainersQuery = useHasuraAvailTrainersQuery(date);

  return (
    <TrainersList skeleton={trainersQuery.isLoading}>
      {trainersQuery.data?.map((trainer) => (
        <HasuraTrainersListItem key={trainer.id} trainer={trainer} />
      ))}
    </TrainersList>
  );
};

export default AvailableTrainersList;
