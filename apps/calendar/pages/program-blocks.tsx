import { PuzzleIcon } from "@heroicons/react/outline";
import { PlusIcon, SaveIcon } from "@heroicons/react/solid";
import fontColorContrast from "font-color-contrast";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "ui/buttons/Button";
import DefaultLayout from "ui/layout/DefaultLayout";
import ListLayout from "ui/layout/list/ListLayout";
import InfoBlock from "ui/InfoBlock";
import ListItem from "ui/layout/list/ListItem";
import {
  createProgramBlocksKey,
  ProgramBlock,
  useProgramBlockInsertMutation,
  useProgramBlocksQuery,
  useProgramBlockUpdateMutation,
} from "supabase/program_blocks.table";
import { useTranslation } from "components/translation";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Formik, FormikHelpers } from "formik";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { SubmitButton, TextField } from "components/formik";
import ColorField from "components/panel/editing/ColorField";
import * as yup from "yup";
import { useRole } from "components/auth/RoleProvider";
import { DefaultCombobox } from "components/combobox";
import classNames from "classnames";

function ProgramBlocksPage() {
  const t = useTranslation();
  const [blockId, setBlockId] = useState<number | null>();
  const [term, setTerm] = useState("");
  const query = useProgramBlocksQuery();

  const role = useRole();
  const isManager = role === "manager" ? true : false;

  const handleCreateNewClick = useCallback(() => {
    setBlockId(null);
  }, []);
  return (
    <DefaultLayout
      icon={<PuzzleIcon />}
      title={t("Program blocks")}
      description={t("Look at the program blocks of your company")}
      buttons={
        isManager && (
          <Button
            onClick={handleCreateNewClick}
            icon={<PlusIcon />}
            variant="contained"
          >
            {t("Create program block")}
          </Button>
        )
      }
    >
      <div className="block py-2 px-4 lg:hidden">
        <DefaultCombobox
          label={t("Program blocks")}
          srLabel
          placeholder={t("Search for program blocks")}
          onChange={setTerm}
          onSelect={(optionalBlock: any) => {
            if (!optionalBlock) {
              return;
            } else {
              query.data?.map((block) => {
                if (block.id === optionalBlock) {
                  setBlockId(block.id);
                }
              });
            }
          }}
        >
          {query.data?.map((block) => {
            return (
              <DefaultCombobox.Option key={block.id} value={block.id}>
                {block.name}
              </DefaultCombobox.Option>
            );
          })}

          {query.isLoading && (
            <Fragment>
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
            </Fragment>
          )}
        </DefaultCombobox>
      </div>
      <ListLayout
        responsive
        items={query.data?.map((block) => (
          <ListItem
            key={block.id}
            selected={block.id === blockId}
            onClick={() => setBlockId(block.id)}
          >
            <div className="flex w-full items-center justify-start gap-4 py-2 px-4">
              <div
                className="w-10 shrink-0 rounded py-1 px-2 text-sm font-semibold"
                style={{
                  backgroundColor: block.color,
                  color: fontColorContrast(block.color),
                }}
              >
                {block.abbreviation}
              </div>

              <div className="truncate" title={block.name}>
                {block.name}
              </div>
            </div>
          </ListItem>
        ))}
      >
        {blockId === undefined && !query.isLoading && (
          <InfoBlock>{t("Select a program block")}</InfoBlock>
        )}

        {blockId !== undefined && (
          <ProgramBlockForm blockId={blockId} onSave={setBlockId} />
        )}
      </ListLayout>
    </DefaultLayout>
  );
}

export default ProgramBlocksPage;

const programBlockSchema = yup.object({
  name: yup.string().required("Required"),
  description: yup.string().notRequired(),
  abbreviation: yup.string().required("Required"),
});

type ProgramBlockValues = yup.InferType<typeof programBlockSchema>;

function ProgramBlockForm({
  blockId,
  onSave,
}: {
  blockId: number | null;
  onSave: (blockId: number) => void;
}) {
  const t = useTranslation();
  const { data: blocks } = useProgramBlocksQuery();

  const programBlock = useMemo(() => {
    if (blockId === null) {
      return null;
    }

    return blocks?.find((block) => block.id === blockId);
  }, [blockId, blocks]);

  const client = useQueryClient();

  const {
    error: updateError,
    data: updatedBlock,
    mutate: update,
  } = useProgramBlockUpdateMutation();

  const {
    error: insertError,
    data: insertedBlock,
    mutate: insert,
  } = useProgramBlockInsertMutation();

  const [color, setColor] = useState(programBlock?.color || "#000");

  const role = useRole();
  const isManager = role === "manager" ? true : false;

  const helpersRef = useRef<FormikHelpers<ProgramBlockValues> | null>(null);

  useEffect(() => {
    setColor(programBlock?.color || "#000");
  }, [programBlock?.color]);

  useEffect(() => {
    if (updateError || insertError) {
      if (!helpersRef.current) {
        throw new Error("Helpers not set");
      }

      helpersRef.current.setSubmitting(false);
    }
  }, [insertError, t, updateError]);

  useEffect(() => {
    if (updatedBlock || insertedBlock) {
      if (!helpersRef.current) {
        throw new Error("Helpers not set");
      }

      helpersRef.current.setSubmitting(false);

      const newBlock = updatedBlock ?? insertedBlock;

      if (!newBlock) {
        throw new Error("No data");
      }

      client.setQueryData<ProgramBlock[]>(
        createProgramBlocksKey(),
        (oldBlocks = []) =>
          programBlock?.id
            ? oldBlocks.map((oldBlock) =>
                oldBlock.id === newBlock.id ? newBlock : oldBlock
              )
            : [...oldBlocks, newBlock]
      );

      onSave(newBlock.id);
      toast.success(t("Program block saved"));
    }
  }, [insertedBlock, programBlock?.id, onSave, client, updatedBlock, t]);

  const handleSubmit = useCallback(
    (
      values: ProgramBlockValues,
      helpers: FormikHelpers<ProgramBlockValues>
    ) => {
      helpersRef.current = helpers;

      /** @todo Use upsert. */
      if (programBlock?.id) {
        update({
          programBlockId: programBlock.id,
          values: { ...values, color },
        });
      } else {
        insert({ ...values, color });
      }
    },
    [color, insert, update, programBlock?.id]
  );

  const initialValues: ProgramBlockValues = {
    name: programBlock?.name || "",
    description: programBlock?.description || "",
    abbreviation: programBlock?.abbreviation || "",
  };

  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "just" }}
    >
      {/** @todo Use react-hook-form package. */}
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={programBlockSchema}
        onSubmit={handleSubmit}
      >
        <Form className="space-y-3 p-2">
          <TextField
            name="name"
            label="Name"
            type="text"
            disabled={!isManager}
          />
          <TextField
            name="description"
            label="Beschreibung"
            type="text"
            disabled={!isManager}
          />

          <ColorField color={color} onChange={setColor} disabled={!isManager} />

          <TextField
            name="abbreviation"
            label="Anmerkung (Wird auf der Schicht angezeigt)"
            type="text"
            disabled={!isManager}
          />
          {isManager && (
            <SubmitButton className="ml-auto" icon={<SaveIcon />}>
              {t("Save")}
            </SubmitButton>
          )}
        </Form>
      </Formik>
    </motion.div>
  );
}
