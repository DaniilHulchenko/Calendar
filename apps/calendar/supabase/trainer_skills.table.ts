import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "supabase/client";
import { Skill } from "./skills.table";

export type TrainerSkill = {
  id: string;
  created_at: Date | null;
  trainer_id: string;
  skill_id: string;
  skill_rate: number;
  skill: Skill;
};

const table = "trainer_skills";

export function createTrainerSkillsKey(trainerId: string) {
  return [table, trainerId];
}

export function useTrainerSkillsQuery(trainerId: string) {
  return useQuery(createTrainerSkillsKey(trainerId), async () => {
    const { data, error } = await supabaseClient
      .from<TrainerSkill>(table)
      .select(`*, skill:skill_id (name)`)
      .eq("trainer_id", trainerId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
}

export function useTrainerSkillInsertMutation() {
  return useMutation(async (values: Partial<TrainerSkill>) => {
    const { data, error } = await supabaseClient
      .from<TrainerSkill>(table)
      .insert(values)
      .select(`*, skill:skill_id (name)`)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
}

export function useTrainerSkillDeleteMutation() {
  return useMutation(async (trainerSkillId: string) => {
    const { data, error } = await supabaseClient.from<TrainerSkill>(table).delete().eq("id", trainerSkillId).single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
}
