import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import { supabaseTrainerByUserId } from "data/calendarQueryKeys";
import { selectTrainer } from "supabase/trainers.table";
import { useQuery } from "@tanstack/react-query";

const useTrainerQuery = () => {
  const user = useSupabaseUser();

  return useQuery(supabaseTrainerByUserId(user.id), async () => {
    const { data, error } = await selectTrainer(user.id);

    if (error) {
      throw new Error(error.message);
    }

    if (data.length === 0) {
      return null;
    }

    return data[0];
  });
};

export default useTrainerQuery;
