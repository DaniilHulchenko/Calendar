import { LeadConflict } from "supabase/lead_conflict";

export const useRefactorConflict = (data: LeadConflict[]) => {
  let currentConflictId: number | undefined;
  const conflicted = data?.filter((conflict) => {
    if (currentConflictId && currentConflictId === conflict.lead_id) {
      return conflict;
    } else {
      currentConflictId = conflict.lead_id;
    }
  });
  return { conflicted };
};
