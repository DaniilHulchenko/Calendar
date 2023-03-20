import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "supabase/client";
import { Profile } from "./profiles.table";

export type Trainer = {
  id: string;
  profile?: Profile;
  created_at: Date | null;
  about_me: string | null;
  driving_license: boolean;
  dlrg_certificate: boolean;
  english: boolean;
  german: boolean;
};

const table = "trainers";

const createNameTraienrs = () => [table];

export const useTrainers = (id: string) =>
  useQuery(createNameTraienrs(), async () => {
    const response = await supabaseClient.from(table).select("*, profiles(*), avatars(*), trainer_skills(*)");
    const skills = await supabaseClient.from("skills").select("*");
    if (response.error) {
      throw new Error(response.error.message);
    }
    const trainers = response.data.map((trainer) => {
      let trainer_skills: any[] = [];
      trainer.trainer_skills.forEach((skill_id: any) => {
        let skill = skills.data?.filter((skill) => {
          if (skill.id === skill_id.skill_id) return skill;
        });
        trainer_skills.push(skill?.[0]);
      });
      return [{ ...trainer, trainer_skills: trainer_skills }];
    });
    return trainers[0];
  });

export const selectTrainers = () =>
  supabaseClient
    .from<Trainer>(table)
    .select("*, profile:profiles!trainers_id_fkey (*, avatar:avatar_id (*), user:users!profiles_id_fkey (*))");

export const selectTrainer = (userId: string) => supabaseClient.from<Trainer>(table).select("*").eq("id", userId);

export type TrainerUpsertValues = Partial<Trainer> & {
  id: Trainer["id"];
};

export const upsertTrainer = (values: TrainerUpsertValues) =>
  supabaseClient.from<Trainer>(table).upsert(values).single();
