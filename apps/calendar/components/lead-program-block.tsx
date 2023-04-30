import {
  createLeadProgramBlockKey,
  LeadProgramBlock,
  useLeadProgramBlockInsertMutation,
  useLeadProgramBlockQuery,
  useLeadProgramBlockUpdateMutation,
} from "supabase/lead_program_blocks.table";
import { ProgramBlock } from "supabase/program_blocks.table";
import fontColorContrast from "font-color-contrast";
import {
  Fragment,
  MouseEventHandler,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { WorkspacePopover } from "./layout";
import { useTranslation } from "./translation";
import { useQueryClient } from "@tanstack/react-query";
import { FormikHelpers } from "formik";
import toast from "react-hot-toast";
import { PanelForm, TextField } from "./formik";
import DetailsListItem from "./panel/details/DetailsListItem";
import * as yup from "yup";

export function LeadProgramBlockPopover({
  block,
  leadId,
}: {
  block: ProgramBlock;
  leadId: number;
}) {
  const query = useLeadProgramBlockQuery(leadId, block.id);

  return (
    <WorkspacePopover
      description={`ID: ${block.id}`}
      style={{
        backgroundColor: block.color,
        color: fontColorContrast(block.color),
      }}
      button={
        <Fragment>
          <span>{block.abbreviation}</span>
          {query.data?.number !== undefined && (
            <span>&nbsp;{query.data.number}</span>
          )}
        </Fragment>
      }
      content={(close: any) => {
        if (query.status === "loading") {
          return <div className="p-6">Loading...</div>;
        }

        if (query.status === "error") {
          return (
            <div className="p-6 text-red-500">Error: {query.error.message}</div>
          );
        }

        return (
          <BlockNumberForm
            leadId={leadId}
            leadProgramBlock={query.data}
            programBlock={block}
            onCancel={() => close()}
            onClose={close}
          />
        );
      }}
    />
  );
}

const blockNumberSchema = yup.object({
  number: yup.number().min(1, "Min 1").required("Required"),
});

type BlockNumberValues = yup.InferType<typeof blockNumberSchema>;

function BlockNumberForm({
  leadProgramBlock,
  programBlock,
  leadId,
  onCancel,
  onClose,
}: {
  leadId: number;
  leadProgramBlock: LeadProgramBlock | null;
  programBlock: ProgramBlock;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  onClose: () => void;
}) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const updateMutation = useLeadProgramBlockUpdateMutation();
  const insertMutation = useLeadProgramBlockInsertMutation();
  const helpersRef = useRef<FormikHelpers<BlockNumberValues> | null>(null);

  useEffect(() => {
    if (updateMutation.error || insertMutation.error) {
      if (!helpersRef.current) {
        throw new Error("Helpers ref is null");
      }

      helpersRef.current.setSubmitting(false);
    }
  }, [insertMutation.error, t, updateMutation.error]);

  useEffect(() => {
    if (updateMutation.data || insertMutation.data) {
      if (!helpersRef.current) {
        throw new Error("Helpers ref is null.");
      }

      helpersRef.current.setSubmitting(false);

      const newBlock = updateMutation.data || insertMutation.data;

      if (!newBlock) {
        throw new Error("No new block found");
      }

      queryClient.setQueryData<LeadProgramBlock>(
        createLeadProgramBlockKey(leadId, programBlock.id),
        newBlock
      );

      onClose();
      toast.success(t("You have stored program block number"));
    }
  }, [
    insertMutation.data,
    leadId,
    onClose,
    programBlock.id,
    queryClient,
    t,
    updateMutation.data,
  ]);

  const handleSubmit = useCallback(
    async (
      values: BlockNumberValues,
      helpers: FormikHelpers<BlockNumberValues>
    ) => {
      helpersRef.current = helpers;

      if (leadProgramBlock) {
        updateMutation.mutate({
          leadId: leadProgramBlock.lead_id,
          programBlockId: leadProgramBlock.program_block_id,
          number: values.number,
        });
      } else {
        insertMutation.mutate({
          values: {
            lead_id: leadId,
            program_block_id: programBlock.id,
            number: values.number,
          },
        });
      }
    },
    [insertMutation, leadProgramBlock, programBlock.id, leadId, updateMutation]
  );

  return (
    <PanelForm
      initialValues={{
        number: leadProgramBlock?.number ?? 0,
      }}
      validationSchema={blockNumberSchema}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <DetailsListItem label="Bausteine" value={programBlock.name} />
      <TextField name="number" label="Anzahl" type="number" />
    </PanelForm>
  );
}
