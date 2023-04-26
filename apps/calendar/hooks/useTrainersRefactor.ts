import { TrainerLead } from "./../supabase/trainer_lead.table";
import { HasuraTrainer } from "loading/queries/hasura";
import { useMemo } from "react";

export const useTrainersRefactor = (allTrainers: HasuraTrainer[], trainersInLead: TrainerLead[], leadId: string) => {
  const trainers = useMemo(() => {
    const invitedTrainers = trainersInLead?.map((invitedTrainer) => ({
      id: invitedTrainer.id_trainers,
      accepted: invitedTrainer.accepted,
      id_lead: invitedTrainer.id_lead,
    }));
    const updatedTrainers = allTrainers
      ?.map((trainer) => {
        const trainerInvitation = invitedTrainers?.find(
          (invited) => invited.id === trainer.id && invited.id_lead === +leadId,
        );
        if (trainerInvitation) {
          return { ...trainer, accepted: trainerInvitation.accepted };
        } else {
          return trainer;
        }
      })
      .filter(
        (trainer) =>
          !trainersInLead
            ?.filter((invited) => invited.accepted !== null && invited.id_lead === +leadId)
            .map((invited) => invited.id_trainers)
            .includes(trainer.id),
      );
    return updatedTrainers;
  }, [allTrainers, trainersInLead]);
  return { trainers };
};
