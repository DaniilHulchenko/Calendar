import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import { supabaseTrainerByUserId } from "data/calendarQueryKeys";
import {
  Trainer,
  TrainerUpsertValues,
  upsertTrainer,
} from "supabase/trainers.table";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useTrainerMutation = () => {
  const user = useSupabaseUser();
  const queryClient = useQueryClient();

  return useMutation(async (values: Omit<TrainerUpsertValues, "id">) => {
    const response = await upsertTrainer({
      ...values,
      id: user.id,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    queryClient.setQueryData<Trainer>(
      supabaseTrainerByUserId(user.id),
      response.data
    );
  });
};

export default useTrainerMutation;
