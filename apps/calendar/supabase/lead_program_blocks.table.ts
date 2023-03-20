import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "supabase/client";

export type LeadProgramBlock = {
  id: number;
  lead_id: number;
  program_block_id: number;
  number: number;
  created_at: string;
};

const table = "lead_program_blocks";

export function createLeadProgramBlockKey(
  leadId: number,
  programBlockId: number | undefined
) {
  return [table, leadId, programBlockId];
}

export function useLeadProgramBlockQuery(leadId: number, blockId: number) {
  return useQuery<LeadProgramBlock | null, PostgrestError>(
    createLeadProgramBlockKey(leadId, blockId),
    async () => {
      const response = await supabaseClient
        .from<LeadProgramBlock>(table)
        .select("*")
        .eq("lead_id", leadId)
        .eq("program_block_id", blockId);

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.length === 0) {
        return null;
      }

      return response.data[0];
    }
  );
}

type UpdateVariables = {
  leadId: number;
  programBlockId: number;
  number: number;
};

export function useLeadProgramBlockUpdateMutation() {
  return useMutation<LeadProgramBlock, PostgrestError, UpdateVariables>(
    async (variables) => {
      const response = await supabaseClient
        .from<LeadProgramBlock>(table)
        .update({ number: variables.number })
        .match({
          lead_id: variables.leadId,
          program_block_id: variables.programBlockId,
        })
        .single();

      if (response.error) {
        throw response.error;
      }

      return response.data;
    }
  );
}

type InsertVariables = {
  values: Partial<LeadProgramBlock>;
};

export function useLeadProgramBlockInsertMutation() {
  return useMutation<LeadProgramBlock, PostgrestError, InsertVariables>(
    async (variables) => {
      const response = await supabaseClient
        .from<LeadProgramBlock>(table)
        .insert(variables.values)
        .single();

      if (response.error) {
        throw response.error;
      }

      return response.data;
    }
  );
}
