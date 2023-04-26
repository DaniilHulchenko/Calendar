import { Tab } from "@headlessui/react";
import TrainersList from "../trainers/TrainersList";
import TrainersListItem from "../trainers/TrainersListItem";
import {
  createNameLeadTeam,
  deleteTrainerLead,
  joinTeamTrainer,
  terminateTeamTrainer,
  useLeadTeam,
  useLeadTeamWithEmail,
  useLeadsTeam,
  usePossibleConflictedTrainerTeam,
  useTrainerLeadQuery,
  useTrainersJoin,
} from "supabase/trainer_lead.table";
import {
  HasuraTrainer,
  useHasuraAvailTrainersQuery,
  useHasuraTrainersQuery,
} from "loading/queries/hasura";
import ProfileAvatar from "components/layout/ProfileAvatar";
import { useContext, useMemo, useState } from "react";
import Button from "ui/buttons/Button";
import { ArchiveIcon, BanIcon, LoginIcon } from "@heroicons/react/outline";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import toast from "react-hot-toast";
import { useTranslation } from "components/translation";
import { useRole } from "components/auth/RoleProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CellContext } from "components/auth/CellProvider";
import { terminateTrainerConflict } from "supabase/lead_conflict";
import { useLeadQuery } from "loading/queries/useLeadsQuery";
import { sendEmail } from "config/email";
import { format } from "date-fns";
import { useRouter } from "next/router";

const TeamTrainersTabPanel = ({
  cellId,
  maxTrainersEvent,
  availsTrainers,
}: {
  cellId: string;
  maxTrainersEvent: number;
  availsTrainers: HasuraTrainer[] | undefined;
}) => {
  const trainersQuery = useHasuraTrainersQuery("");
  const trainerLeads = useTrainerLeadQuery(
    (Array.isArray(cellId) ? cellId[0] : cellId) || "0"
  );
  const cellContext = useContext(CellContext);
  const teams = useLeadsTeam();
  const teamWithEmail = useLeadTeamWithEmail(+cellId);
  const lead = useLeadQuery(+cellId);
  const [terminated, setTermianted] = useState(false);
  const [joinFetch, setJoinFetch] = useState(false);
  const [join, setJoin] = useState(false);
  const role = useRole();
  const [deletedTrainer, setDeletedTrainer] = useState<string>();
  const router = useRouter();
  const { day } = router.query;
  const possibleConflicredTrainer = usePossibleConflictedTrainerTeam(
    typeof day === "string" ? day : ""
  );
  const t = useTranslation();

  const user = useSupabaseUser();
  const acceptedTrainers = useLeadTeam(+cellId);
  const trainersJoin = useTrainersJoin(+cellId);
  const terminateHandler = async () => {
    setTermianted(true);
    const result = await terminateTeamTrainer(+cellId, user.id);
    if (result) {
      toast.success(t("You requested to terminate your invitation"));
    } else {
      toast.error(t("Something went wrong"));
      setTermianted(false);
    }
  };

  const queryClient = useQueryClient();

  const sendEmailHTML = (leadName: string, date: string) => {
    return `<div><p>You have been terminated from the Lead: ${leadName}(${date})</p></div>`;
  };

  // createNameLeadTeam
  const deleteTrainer = useMutation({
    mutationFn: deleteTrainerLead,
    onSuccess: (updatedTeam: any) => {
      queryClient.setQueryData(
        createNameLeadTeam(+cellId),
        (oldTeam: any[] = []) => {
          return oldTeam.filter(
            (team) => team.id_profiles !== updatedTeam[0].id_profiles
          );
        }
      );
      trainersQuery.refetch();
      acceptedTrainers.refetch();
      trainerLeads.refetch();
      teams.refetch();
      possibleConflicredTrainer.refetch();
      cellContext.setUpdated?.(false);
      toast.success(t("Trainer terminated"));
    },
    onError: () => {
      toast.error(t("Something went wrong"));
      teams.refetch();
      cellContext.setUpdated?.(false);
      setTermianted(false);
    },
  });

  const handleJoin = async (trainerId: string) => {
    const isAvailTrainer = availsTrainers?.filter(
      (trainer) => trainer.id === trainerId
    );

    if (!isAvailTrainer || isAvailTrainer?.length === 0) {
      toast.error(t("You are not available at this day"));
      return;
    }

    setJoin(false);
    setJoinFetch(true);
    const accepted = acceptedTrainers.data?.filter(
      (acceptedTraienrs) => acceptedTraienrs.id_trainers === user.id
    );

    const result =
      Array.isArray(accepted) && accepted.length === 0
        ? await joinTeamTrainer(+cellId, user.id)
        : toast.error(t("You are taking a part in the event"));

    if (Array.isArray(result) && result.length > 0) {
      setJoinFetch(false);
      toast.success(t("You have requested to join the event"));
      trainersJoin.refetch();
    } else {
      setJoinFetch(false);
      setJoin(false);
      Array.isArray(result) &&
        toast.error(
          t("The request to join in the event has already been sent")
        );
    }
  };

  const managerTerminateHandler = async (id: string) => {
    setTermianted(true);
    cellContext.setUpdated?.(true);
    deleteTrainer.mutate({ leadId: cellId, trainerId: id });
    teamWithEmail.data?.forEach((team) => {
      if (team.id_profiles === id) {
        sendEmail(
          team.users.email,
          sendEmailHTML(
            lead.data?.[0].event_title
              ? `${lead.data?.[0].event_title} - ${lead.data?.[0].customer_name}`
              : lead.data?.[0].customer_name,
            `${format(
              new Date(lead.data?.[0].arrival_at || ""),
              "dd-MM-yyyy"
            )} - ${format(
              new Date(
                lead.data?.[0].departure || lead.data?.[0].arrival_at || ""
              ),
              "dd-MM-yyyy"
            )}`
          ),
          `You have been terminated from the Lead`
        );
      }
    });
    terminateTrainerConflict(
      new Date(lead.data?.[0].arrival_at),
      +lead.data?.[0].id,
      id
    );
  };
  const team = useMemo(() => {
    const result: {
      termiante: any;
      id: string;
      about_me?: string | undefined;
      driving_license: boolean;
      dlrg_certificate: boolean;
      profile: any;
      trainer_skills: any;
      accepted?: boolean | undefined;
    }[] = [];
    trainersQuery.data?.forEach((trainer) => {
      const acceptedId = acceptedTrainers.data?.filter((acceptedTrainer) => {
        if (
          acceptedTrainer.accepted &&
          acceptedTrainer.id_profiles === trainer.id
        )
          return {
            id: acceptedTrainer.id_profiles,
            terminate: acceptedTrainer.termiante,
          };
      });
      if (acceptedId && acceptedId[0]?.id_profiles === trainer.id) {
        result.push({ ...trainer, termiante: acceptedId[0]?.terminate });
      }
    });
    return result;
  }, [trainersQuery.data, acceptedTrainers.data]);
  return (
    <Tab.Panel>
      <div className="flex flex-col">
        {/* {role === "trainer"} */}
        <div className="mb-[-10px] pt-4 pl-6">
          {role === "trainer" && team.length < maxTrainersEvent && !join && (
            <Button
              type="button"
              variant="outlined"
              onClick={() => handleJoin(user.id)}
              disabled={joinFetch}
              icon={<LoginIcon />}
            >
              {t("Join")}
            </Button>
          )}
        </div>
        <TrainersList
          skeleton={trainersQuery.isLoading || acceptedTrainers.isLoading}
        >
          {team.length > 0
            ? team?.map((trainer) => (
                <div key={trainer.id} className="flex justify-between">
                  <TrainersListItem
                    circle={
                      <ProfileAvatar url={trainer.profile?.avatar?.url} small />
                    }
                    title={
                      trainer.profile?.name || trainer.profile?.user?.email
                    }
                    description={trainer.profile?.contact}
                  />
                  {role === "manager" &&
                    (trainer.termiante || trainer.id === user.id) && (
                      <Button
                        type="button"
                        variant="contained"
                        icon={<BanIcon />}
                        onClick={() => managerTerminateHandler(trainer.id)}
                      >
                        {t("Terminate")}
                      </Button>
                    )}

                  {trainer.id === user.id && role === "trainer" && (
                    <Button
                      type="button"
                      variant="outlined"
                      icon={<BanIcon />}
                      disabled={trainer.termiante || terminated}
                      onClick={terminateHandler}
                    >
                      {trainer.termiante || terminated
                        ? t("Terminated")
                        : t("Terminate")}
                    </Button>
                  )}
                </div>
              ))
            : !trainersQuery.isLoading && (
                <div className="flex flex-col items-center justify-center py-6 text-indigo-500">
                  {t("Team is empty")}
                  <div className="h-20 w-20">
                    <ArchiveIcon color="text-indigo-400" />
                  </div>
                </div>
              )}
        </TrainersList>
      </div>
    </Tab.Panel>
  );
};

export default TeamTrainersTabPanel;
