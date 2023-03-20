import { useMutation } from "@tanstack/react-query";
import { supabaseClient } from "supabase/client";
import { Avatar } from "supabase/avatars.table";

const bucketId = "avatars";

export async function getAvatarUrl(path: string | undefined) {
  if (!path) {
    return null;
  }

  const response = await supabaseClient.storage.from(bucketId).download(path);

  if (response.error) {
    throw response.error;
  }

  return response.data && URL.createObjectURL(response.data);
}

export const uploadAvatar = (path: string, blob: Blob) =>
  supabaseClient.storage.from(bucketId).upload(path, blob);

export function useAvatarRemoveFileMutation() {
  return useMutation(async (avatar: Avatar) => {
    const { data, error } = await supabaseClient.storage
      .from(bucketId)
      .remove([avatar.url]);

    if (error) {
      throw error;
    }

    return data;
  });
}
