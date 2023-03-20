/** @todo move to each query */

export const supabaseAvatarById = (id: number | null | undefined) => [
  "avatar",
  id,
];

export const supabaseProfiles = () => ["profiles"];

export const supabaseProfileByUserId = (userId: string) => ["profile", userId];

export const supabaseTrainerByUserId = (userId: string) => ["trainer", userId];

export const supabaseUserById = (id: string | undefined) => ["user", id];

export const supabaseAvail = (trainerId: string, date: number | Date) => [
  "avail",
  trainerId,
  date,
];
