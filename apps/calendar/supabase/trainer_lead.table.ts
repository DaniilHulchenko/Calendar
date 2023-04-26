import toast from "react-hot-toast";
import { supabaseClient } from "./client";
import { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

export type TrainerLead = {
  id: number;
  created_at: Date | null;
  id_trainers: string;
  id_lead: number;
  accepted: boolean;
};

const table = "trainer_lead";

export const trainerLeadName = (leadId: string) => ["leadId", leadId];

export const useTrainerLeadQuery = (leadId: string) => {
  return useQuery<TrainerLead[], PostgrestError>(trainerLeadName(leadId), async () => {
    if (leadId) {
      const response = await supabaseClient.from(table).select(`*`);

      if (response.error) {
        throw response.error;
      }

      return response.data;
    } else {
      return [];
    }
  });
};

export const deleteTrainerLead = async (infoTraienr: { leadId: string; trainerId: string }) => {
  const response = await supabaseClient
    .from("trainer_lead")
    .delete()
    .eq("id_lead", infoTraienr.leadId)
    .eq("id_trainers", infoTraienr.trainerId)
    .select("*");
  if (response.error) {
    throw response.error;
  }

  return response.data;
};
export const terminateTeamTrainer = async (leadId: number, trainerId: string) => {
  const response = await supabaseClient
    .from("trainer_lead")
    .update({ terminate: true })
    .eq("id_lead", leadId)
    .eq("id_trainers", trainerId)
    .single();
  if (response.error) {
    throw response.error;
  }

  return response.data;
};

export const joinTeamTrainer = async (leadId: number, trainerId: string) => {
  const response = await supabaseClient
    .from("trainer_lead_join")
    .select("*")
    .eq("id_trainer", trainerId)
    .eq("id_lead", leadId);
  if (response.data && response.data?.length > 0) {
    return [];
  } else {
    const response = await supabaseClient
      .from("trainer_lead_join")
      .insert({ id_trainer: trainerId, id_lead: leadId, join: true })
      .single();
    if (response.error) {
      throw response.error;
    }

    return [response.data];
  }
};
export const createNameTrainersJoin = (leadId: number) => ["trainerJoin", leadId];
export const createNameTrainersJoinedLead = () => ["trainerJoin"];
export const useTrainersJoinedLead = () => {
  return useQuery(createNameTrainersJoinedLead(), async () => {
    const response = await supabaseClient.from("trainer_lead_join").select("*");
    if (response.error) {
      throw response.error;
    }

    return response.data;
  });
};
export const useTrainersJoin = (leadId: number) => {
  return useQuery(createNameTrainersJoin(leadId), async () => {
    const response = await supabaseClient.from("trainer_lead_join").select("*, trainers(*)").eq("id_lead", leadId);
    if (response.error) {
      throw response.error;
    }

    return response.data;
  });
};
export const reserveTrainer = async ({ trainerId, leadId }: { trainerId: string; leadId: number }) => {
  const deleteResponse = await supabaseClient
    .from("trainer_lead_join")
    .delete()
    .eq("id_lead", leadId)
    .eq("id_trainer", trainerId);
  if (!deleteResponse.error) {
    const response = await supabaseClient
      .from(table)
      .upsert({ id_profiles: trainerId, id_lead: leadId, id_trainers: trainerId, accepted: true, id_users: trainerId })
      .single();
    if (response.error) {
      throw response.error;
    }

    return [response.data];
  } else {
    throw deleteResponse.error;
  }
};

export const createNameLeadTeam = (leadId: number) => ["trainerLeadTeam", leadId];
export const createNameLeadTeamWithEmail = (leadId: number) => ["trainerLeadTeamWithEmail", leadId];
export const createNameLeadsTeam = () => ["trainerLeadsTeam"];
export const useLeadsTeam = () => {
  return useQuery(createNameLeadsTeam(), async () => {
    const response = await supabaseClient.from("trainer_lead").select("*");
    if (response.error) {
      throw response.error;
    }

    return response.data;
  });
};
export const useLeadTeam = (leadId: number) => {
  return useQuery(createNameLeadTeam(leadId), async () => {
    const response = await supabaseClient.from("trainer_lead").select("*").eq("id_lead", leadId).eq("accepted", true);
    if (response.error) {
      throw response.error;
    }

    return response.data;
  });
};
export const useLeadTeamWithEmail = (leadId: number) => {
  return useQuery(createNameLeadTeamWithEmail(leadId), async () => {
    const response = await supabaseClient.from("trainer_lead").select("*, users(*)").eq("id_lead", leadId).eq("accepted", true);
    if (response.error) {
      throw response.error;
    }

    return response.data;
  });
};

export const createPossibleConflictedTrainerTeam = (day: string) => ["trainerLeadTeam", day];

export const usePossibleConflictedTrainerTeam = (day: string) => {
  return useQuery(createPossibleConflictedTrainerTeam(day), async () => {
    const response = await supabaseClient.from("trainer_lead").select("*").eq("arrival_at_lead", day)
    if (response.error) {
      throw response.error;
    }

    return response.data;
  });
};
export const setTrainerLeadEmail = async ({ id_trainer, leadId, arrivalAtLead }: { id_trainer: string; leadId: string,arrivalAtLead:string }) => {
  const response = await supabaseClient
    .from(table)
    .upsert({ id_profiles: id_trainer, id_lead: leadId, id_trainers: id_trainer, accepted: true, arrival_at_lead: arrivalAtLead, id_users: id_trainer })
    .single();
  if (response.error) {
    throw response.error;
  }

  return [response.data];
};
