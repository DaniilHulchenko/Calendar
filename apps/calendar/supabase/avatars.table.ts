import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "supabase/client";

export type Avatar = {
  id: number;
  created_at: string;
  url: string;
  profile_id: string;
  avatar_id: string;
};

const table = "avatars";

export const createAvatarsKey = (profileId: string) => [table, profileId];

export function useAvatarsQuery(profileId: string) {
  return useQuery<Avatar[] | null, PostgrestError>({
    queryKey: createAvatarsKey(profileId),
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from<Avatar>(table)
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });
}

export const selectAvatar = (id: number) => supabaseClient.from<Avatar>(table).select("*").eq("id", id).single();

export const insertAvatar = (values: Partial<Avatar>) => supabaseClient.from<Avatar>(table).insert(values).single();

export function useAvatarDeleteMutation() {
  return useMutation(async (avatarId: number) => {
    const { data, error } = await supabaseClient.from<Avatar>(table).delete().eq("id", avatarId).single();

    if (error) {
      throw error;
    }

    return data;
  });
}
