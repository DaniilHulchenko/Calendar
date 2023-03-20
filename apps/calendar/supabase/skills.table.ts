import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "supabase/client";

export type Skill = {
  id: string;
  name: string;
  skill_rate: number;
};

const table = "skills";

export function createSkillsSearchKey(value: string) {
  return [table, value];
}

export function useSkillsSearchQuery(value: string) {
  return useQuery(createSkillsSearchKey(value), async () => {
    const baseBuilder = supabaseClient.from<Skill>(table).select();

    const builder = value ? baseBuilder.ilike("name", `%${value}%`) : baseBuilder;

    const { data, error } = await builder;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
}

export async function insertSkill(skill: Omit<Skill, "id">) {
  const response = await supabaseClient.from<Skill>(table).insert(skill).single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

const skillsTable = "trainer_skills";
export async function updateSkillRate(trainerId: string, rate: number) {
  const response = await supabaseClient.from(skillsTable).update({ skill_rate: rate }).eq("id", trainerId).single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}
