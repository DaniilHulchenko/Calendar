import { ProgramBlock } from "supabase/program_blocks.table";
import { supabaseClient } from "supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

export type TrainerProgramBlock = {
  id: number;
  trainer_id: string;
  program_block_id: number;
  created_at: string;
  program_blocks: ProgramBlock;
};

const table = "trainer_program_blocks";

export function createTrainerProgramBlocksKey(trainerId: string) {
  return [table, trainerId];
}

export function useTrainerProgramBlocksQuery(trainerId: string) {
  return useQuery(createTrainerProgramBlocksKey(trainerId), async () => {
    const response = await supabaseClient
      .from<TrainerProgramBlock>(table)
      .select("*, program_blocks(*)")
      .eq("trainer_id", trainerId);

    if (response.error) {
      throw response.error;
    }
    return response.data;
  });
}

type UpdateVariables = {
  programBlockId: number;
  values: Partial<ProgramBlock>;
};

export function useProgramBlockUpdateMutation() {
  return useMutation<ProgramBlock, PostgrestError, UpdateVariables>(async (variables) => {
    const response = await supabaseClient
      .from<ProgramBlock>(table)
      .update(variables.values)
      .eq("id", variables.programBlockId)
      .single();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  });
}

export function useProgramBlockInsertMutation() {
  return useMutation<ProgramBlock, PostgrestError, Partial<ProgramBlock>>(async (variables) => {
    const response = await supabaseClient.from<ProgramBlock>(table).insert(variables).single();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  });
}

export type TrainerProgramBlockInsert = {
  trainer_id: string;
  program_block_id: number;
};

const trainerTable = "trainer_program_blocks";

export function useTrainerprogramBlockDeleteMutation() {
  return useMutation(async (trainerProgramBlockId: number) => {
    const { data, error } = await supabaseClient
      .from<ProgramBlock>(table)
      .delete()
      .eq("id", trainerProgramBlockId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
}

export function useProgramBlockMutation() {
  return useMutation(async (values: Partial<TrainerProgramBlock>) => {
    const { data, error } = await supabaseClient
      .from<TrainerProgramBlock>(table)
      .insert(values)
      .select(`*, program_blocks(*)`)
      .single();
    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
}

export async function insertProgramBlock(programBlock: { trainer_id: string; program_block_id: number }) {
  const response = await supabaseClient.from<TrainerProgramBlock>(trainerTable).insert(programBlock).single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}
