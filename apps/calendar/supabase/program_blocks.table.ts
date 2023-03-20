import { supabaseClient } from "supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

export type ProgramBlock = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  abbreviation: string;
  created_at: string;
};

const table = "program_blocks";

export function createProgramBlocksKey() {
  return [table];
}

export function useProgramBlocksQuery() {
  return useQuery<ProgramBlock[], PostgrestError>(
    createProgramBlocksKey(),
    async () => {
      const response = await supabaseClient
        .from<ProgramBlock>(table)
        .select("*");

      if (response.error) {
        throw response.error;
      }

      return response.data;
    }
  );
}

export function useProgramBlocksSearchQuery(value: string) {
  return useQuery({
    queryKey: [table, "search", value],
    queryFn: async () => {
      const baseBuilder = supabaseClient.from<ProgramBlock>(table).select();

      const build = value
        ? baseBuilder.ilike("name", `%${value}%`)
        : baseBuilder;

      const response = await build;

      if (response.error) {
        throw response.error;
      }

      return response.data;
    },
  });
}

type UpdateVariables = {
  programBlockId: number;
  values: Partial<ProgramBlock>;
};

export function useProgramBlockUpdateMutation() {
  return useMutation<ProgramBlock, PostgrestError, UpdateVariables>(
    async (variables) => {
      const response = await supabaseClient
        .from<ProgramBlock>(table)
        .update(variables.values)
        .eq("id", variables.programBlockId)
        .single();

      if (response.error) {
        throw response.error;
      }

      return response.data;
    }
  );
}

export function useProgramBlockInsertMutation() {
  return useMutation<ProgramBlock, PostgrestError, Partial<ProgramBlock>>(
    async (variables) => {
      const response = await supabaseClient
        .from<ProgramBlock>(table)
        .insert(variables)
        .single();

      if (response.error) {
        throw response.error;
      }

      return response.data;
    }
  );
}
