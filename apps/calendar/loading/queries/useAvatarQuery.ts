import { supabaseAvatarById } from "data/calendarQueryKeys";
import { selectAvatar } from "supabase/avatars.table";
import { useQuery } from "@tanstack/react-query";

const useAvatarQuery = (avatarId: number | null | undefined) =>
  useQuery(supabaseAvatarById(avatarId), async () => {
    if (!avatarId) {
      return null;
    }

    const response = await selectAvatar(avatarId);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  });

export default useAvatarQuery;
