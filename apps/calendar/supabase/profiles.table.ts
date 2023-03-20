import { supabaseProfileByUserId } from "data/calendarQueryKeys";
import { supabaseClient } from "supabase/client";
import { Avatar } from "supabase/avatars.table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Profile = {
  id: string;
  user?: User;
  updated_at: Date | null;
  name: string | null;
  contact: string | null;
  avatar_id: number | null;
  avatar?: Avatar | null;
};

type User = {
  id: string;
  email: string;
};

const table = "profiles";

export function useProfileQuery(userId: string) {
  return useQuery(supabaseProfileByUserId(userId), async () => {
    const isExist = await supabaseClient.from<Profile>(table).select("*").eq("id", userId);
    if (Array.isArray(isExist.data) && isExist.data.length === 0) {
      await supabaseClient.from<Profile>(table).insert({ id: userId });
    }
    const response = await supabaseClient.from<Profile>(table).select(`*`).eq("id", userId);

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (response.data.length === 0) {
      return;
    }

    return response.data[0];
  });
}

type ProfileUpdateValues = Partial<Profile> & {
  id: Profile["id"];
};

export function useProfileMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation(async (values: ProfileUpdateValues) => {
    const { data, error } = await supabaseClient.from<Profile>(table).update(values).eq("id", values.id).single();

    if (error) {
      throw error;
    }

    queryClient.setQueryData<Profile>(supabaseProfileByUserId(userId), data);

    return data;
  });
}
