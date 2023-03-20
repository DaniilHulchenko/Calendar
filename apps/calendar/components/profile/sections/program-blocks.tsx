import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import { DefaultCombobox } from "components/combobox";
import { useTranslation } from "components/translation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ProgramBlock,
  useProgramBlocksSearchQuery,
} from "supabase/program_blocks.table";
import {
  createTrainerProgramBlocksKey,
  insertProgramBlock,
  TrainerProgramBlock,
  useProgramBlockInsertMutation,
  useTrainerProgramBlocksQuery,
  useProgramBlockMutation,
  useTrainerprogramBlockDeleteMutation,
} from "supabase/trainer_program_blocks.table";
import InfoBlock from "ui/InfoBlock";
import { DropdownBox, ProfileSection } from "../layout";
import { motion } from "framer-motion";
import { XIcon } from "@heroicons/react/outline";
import toast from "react-hot-toast";
import classNames from "classnames";
import fontColorContrast from "font-color-contrast";

function ProgramBlockSection() {
  const t = useTranslation();

  const { id: trainerId } = useSupabaseUser();
  const { data: programBlocks, isLoading } =
    useTrainerProgramBlocksQuery(trainerId);

  const {
    data: insertedProgramBlock,
    mutate: insertProgramBlock,
    reset: resetInsertedProgramBlock,
  } = useProgramBlockMutation();

  const handleAddTrainerProgramBlock = useCallback(
    (id: number) => {
      insertProgramBlock({ trainer_id: trainerId, program_block_id: id });
    },
    [insertProgramBlock, trainerId]
  );

  const client = useQueryClient();

  useEffect(() => {
    if (!insertedProgramBlock) {
      return;
    }
    resetInsertedProgramBlock();

    client.setQueryData<any>(
      createTrainerProgramBlocksKey(trainerId),
      (oldProgramBlocks = []) => [...oldProgramBlocks, insertedProgramBlock]
    );
    toast.success(t("Trainer program block added"));
  }, [client, insertedProgramBlock, resetInsertedProgramBlock, t, trainerId]);

  const disabledProgramBlocksId = useMemo(
    () => programBlocks?.map((programBlocks) => programBlocks.program_block_id),
    [programBlocks]
  );

  return (
    <ProfileSection
      title={t("Program blocks")}
      description={t("Provide how good you are with specific program blocks")}
    >
      <DropdownBox
        className="grow"
        dropdown={
          <ProgramBlocksCombobox
            disabledProgramBlocksId={disabledProgramBlocksId}
            onSelect={(block) => handleAddTrainerProgramBlock(block.id)}
          />
        }
      >
        {isLoading && <ProgramBlocksSkeleton />}
        {programBlocks?.map((item: TrainerProgramBlock) => {
          return (
            <PrgoramBlocksListItem
              key={item.id}
              id={item.id}
              name={item["program_blocks"].name}
              color={item["program_blocks"].color}
            />
          );
        })}

        {programBlocks?.length === 0 && (
          <InfoBlock>{t("No program blocks")}</InfoBlock>
        )}
      </DropdownBox>
    </ProfileSection>
  );
}

export default ProgramBlockSection;

function ProgramBlocksCombobox(props: {
  onSelect: (block: ProgramBlock) => void;
  disabledProgramBlocksId: number[] | undefined;
}) {
  const t = useTranslation();
  const [value, setValue] = useState("");
  const query = useProgramBlocksSearchQuery(value);
  const queryClient = useQueryClient();

  const insertProgramBlockMutation = useMutation({
    mutationFn: insertProgramBlock,
    onSuccess: (insertedProgramBlock: any) => {
      queryClient.setQueryData<any>(
        createTrainerProgramBlocksKey(value),
        (oldProgramBlocks = []) => [...oldProgramBlocks, insertedProgramBlock]
      );

      props.onSelect(insertedProgramBlock);
    },
  });
  return (
    <DefaultCombobox
      label={t("Program blocks search")}
      placeholder={t("Search for program blocks")}
      disabled={insertProgramBlockMutation.isLoading}
      onChange={setValue}
      onSelect={(block: any) => {
        if (!block) {
          return;
        }
        const { id } = block;

        if (id) {
          props.onSelect({ ...block, id });
        } else {
          insertProgramBlockMutation.mutate(block);
        }
      }}
    >
      {query.data?.map((block) => (
        <DefaultCombobox.Option
          key={block.id}
          value={block}
          disabled={props.disabledProgramBlocksId?.includes(block.id)}
        >
          {block.name}
        </DefaultCombobox.Option>
      ))}
      {query.isLoading && (
        <>
          {[...Array(6)].map((_, index) => {
            const part = index % 3;

            return (
              <DefaultCombobox.Message key={index}>
                <div
                  className={classNames(
                    "h-4 animate-pulse rounded bg-gray-200",
                    part > 0 && `w-${part}/3`
                  )}
                />
              </DefaultCombobox.Message>
            );
          })}
        </>
      )}
    </DefaultCombobox>
  );
}

function PrgoramBlocksListItem({
  id,
  name,
  color,
}: {
  id: number;
  name: string;
  color: string;
}) {
  const t = useTranslation();
  const { id: trainerId } = useSupabaseUser();
  const client = useQueryClient();

  const {
    data: deletedProgramBlock,
    mutate: deleteProgramBlock,
    reset: resetDeletedProgramblock,
  } = useTrainerprogramBlockDeleteMutation();

  useEffect(() => {
    if (!deletedProgramBlock) {
      return;
    }

    resetDeletedProgramblock();

    client.setQueryData<TrainerProgramBlock[]>(
      createTrainerProgramBlocksKey(trainerId),
      (oldTrainerProgramBlock = []) =>
        oldTrainerProgramBlock.filter(
          (programBlock) => programBlock.id !== deletedProgramBlock.id
        )
    );

    toast.success(t("Trainer program block deleted"));
  }, [client, deletedProgramBlock, resetDeletedProgramblock, t, trainerId]);

  const handleDelete = useCallback(() => {
    deleteProgramBlock(id);
  }, [deleteProgramBlock, id]);

  return (
    <Chip onDelete={handleDelete} color={color}>
      {name}
    </Chip>
  );
}

function Chip({
  children,
  onDelete,
  color,
}: {
  children: string;
  onDelete: () => void;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ backgroundColor: color, color: fontColorContrast(color) }}
      className="flex items-center space-x-2 rounded-full py-2 pl-3 pr-2"
    >
      <div
        className="max-w-[12em] truncate text-sm font-semibold"
        title={children}
      >
        {children}
      </div>

      <button
        className="rounded-full bg-slate-100  p-1 text-black transition hover:bg-slate-200 hover:text-gray-600"
        onClick={onDelete}
      >
        <XIcon className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

function ProgramBlocksSkeleton() {
  return (
    <>
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="h-9 w-24 animate-pulse rounded-full bg-gray-200"
        />
      ))}
    </>
  );
}
