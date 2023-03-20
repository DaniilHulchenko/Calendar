import {
  UseMutateAsyncFunction,
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import classNames from "classnames";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import { DefaultCombobox } from "components/combobox";
import { useTranslation } from "components/translation";
import { motion } from "framer-motion";
import {
  Fragment,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast, { LoaderIcon } from "react-hot-toast";
import {
  createSkillsSearchKey,
  insertSkill,
  Skill,
  useSkillsSearchQuery,
  updateSkillRate,
} from "supabase/skills.table";
import {
  createTrainerSkillsKey,
  TrainerSkill,
  useTrainerSkillDeleteMutation,
  useTrainerSkillInsertMutation,
  useTrainerSkillsQuery,
} from "supabase/trainer_skills.table";
import InfoBlock from "ui/InfoBlock";
import { DropdownBox, ProfileSection } from "../layout";
import { XIcon } from "@heroicons/react/solid";
import React from "react";
import { useProfileMutation } from "supabase/profiles.table";

function SkillsSection() {
  const t = useTranslation();
  const { id: trainerId } = useSupabaseUser();

  const { data: skills, isLoading: skillsAreLoading } =
    useTrainerSkillsQuery(trainerId);

  const client = useQueryClient();

  const {
    data: insertedSkill,
    mutate: insertSkill,
    reset: resetInsertedSkill,
  } = useTrainerSkillInsertMutation();

  useEffect(() => {
    if (!insertedSkill) {
      return;
    }
    resetInsertedSkill();

    client.setQueryData<TrainerSkill[]>(
      createTrainerSkillsKey(trainerId),
      (oldSkills = []) => [...oldSkills, insertedSkill]
    );

    toast.success(t("Trainer skill added"));
  }, [client, insertedSkill, resetInsertedSkill, t, trainerId]);

  const disabledSkillIds = useMemo(
    () => skills?.map((skill) => skill.skill_id),
    [skills]
  );

  const handleSelect = useCallback(
    (skill: Skill) => {
      insertSkill({
        trainer_id: trainerId,
        skill_id: skill.id,
      });
    },
    [insertSkill, trainerId]
  );

  return (
    <ProfileSection
      title={t("Skills")}
      description={t("Provide what you can do as a trainer")}
    >
      <DropdownBox
        className="grow"
        dropdown={
          <SkillsCombobox
            disabledSkillIds={disabledSkillIds}
            canCreate
            onSelect={handleSelect}
          />
        }
        dashed={skills?.length === 0}
      >
        {skillsAreLoading && <SkillsSkeleton />}

        {skills?.map(({ id, skill, skill_rate }) => (
          <SkillListItem
            key={id}
            id={id}
            name={skill.name}
            currentRate={skill_rate}
          />
        ))}

        {skills?.length === 0 && <InfoBlock>{t("No skills")}</InfoBlock>}
      </DropdownBox>
    </ProfileSection>
  );
}

export default SkillsSection;

function SkillsCombobox({
  disabledSkillIds,
  canCreate,
  onSelect,
}: {
  disabledSkillIds: string[] | undefined;
  canCreate?: boolean;
  onSelect: (skill: Skill) => void;
}) {
  const t = useTranslation();

  const [value, setValue] = useState("");
  const queryClient = useQueryClient();

  const { data: skills, isLoading: skillsAreLoading } =
    useSkillsSearchQuery(value);

  const insertSkillMutation = useMutation({
    mutationFn: insertSkill,
    onSuccess: (insertedSkill) => {
      queryClient.setQueryData<Skill[]>(
        createSkillsSearchKey(value),
        (oldSkills = []) => [...oldSkills, insertedSkill]
      );

      onSelect(insertedSkill);
    },
  });

  const skillNotFound =
    skills?.length === 0 && !skillsAreLoading && value.length > 0;

  return (
    <DefaultCombobox
      label={t("Search skills")}
      srLabel
      placeholder={t("Search for skills")}
      disabled={insertSkillMutation.isLoading}
      onChange={setValue}
      onSelect={(optionSkill: OptionSkill | null) => {
        if (!optionSkill) {
          return;
        }

        const { id } = optionSkill;

        if (!canCreate && !id) {
          throw new Error("Cannot create a new skill without permission.");
        }

        if (id) {
          onSelect({ ...optionSkill, id });
        } else {
          insertSkillMutation.mutate(optionSkill);
        }
      }}
    >
      {skills?.map((skill) => {
        return (
          <DefaultCombobox.Option
            key={skill.id}
            value={skill}
            disabled={disabledSkillIds?.includes(skill.id)}
          >
            {skill.name}
          </DefaultCombobox.Option>
        );
      })}

      {skillsAreLoading && (
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

      {canCreate && skillNotFound && (
        <DefaultCombobox.Option value={{ name: value }}>
          Create <span className="font-bold">{value}</span>
        </DefaultCombobox.Option>
      )}

      {!canCreate && skillNotFound && (
        <DefaultCombobox.Message>Not found</DefaultCombobox.Message>
      )}
    </DefaultCombobox>
  );
}

type OptionSkill = Omit<Skill, "id"> & {
  id?: string;
};

function SkillsSkeleton() {
  return (
    <Fragment>
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="h-9 w-24 animate-pulse rounded-full bg-gray-200"
        />
      ))}
    </Fragment>
  );
}

function SkillListItem({
  id,
  name,
  currentRate,
}: {
  id: string;
  name: string;
  currentRate: number;
}) {
  const t = useTranslation();
  const { id: trainerId } = useSupabaseUser();
  const client = useQueryClient();

  const {
    data: deletedSkill,
    mutate: deleteSkill,
    reset: resetDeletedSkill,
  } = useTrainerSkillDeleteMutation();

  useEffect(() => {
    if (!deletedSkill) {
      return;
    }

    resetDeletedSkill();

    client.setQueryData<TrainerSkill[]>(
      createTrainerSkillsKey(trainerId),
      (oldTrainerSkills = []) =>
        oldTrainerSkills.filter(
          (trainerSkill) => trainerSkill.id !== deletedSkill.id
        )
    );

    toast.success(t("Trainer skill deleted"));
  }, [client, deletedSkill, resetDeletedSkill, t, trainerId]);

  const handleDelete = useCallback(() => {
    deleteSkill(id);
  }, [deleteSkill, id]);

  return (
    <Chip onDelete={handleDelete} trainerId={id} currentRate={currentRate}>
      {name}
    </Chip>
  );
}

interface ChipProps {
  children: string;
  trainerId: string;
  currentRate: number;
  onDelete: () => void;
}

function Chip({ children, onDelete, trainerId, currentRate }: ChipProps) {
  const [showSkillRate, setShowSkillRate] = useState(false);
  const [widthWrapper, setWidthWrapper] = useState(0);
  const [rate, setRate] = useState<number>(currentRate || 0);
  const widthRef = useRef<any>(null);

  const t = useTranslation();

  const updateSkillMutation = useMutation(
    async (rate: number) => {
      return updateSkillRate(trainerId, rate);
    },
    {
      onSuccess: (updatedSkill) => {
        toast.success(t("Rating updated successfully"));
        setRate(updatedSkill.skill_rate);
      },
    }
  );

  useEffect(() => {
    widthRef.current && setWidthWrapper(+widthRef.current.offsetWidth);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex items-center space-x-2 rounded-full bg-indigo-200 py-2 pl-3 pr-2 text-indigo-900"
      onMouseEnter={() => setShowSkillRate(true)}
      onMouseLeave={() => setShowSkillRate(false)}
      ref={widthRef}
    >
      <div
        className="max-w-[12em] truncate text-sm font-semibold"
        title={children}
      >
        {children}
      </div>

      <button
        className="rounded-full bg-indigo-400 p-1 text-indigo-200 transition hover:bg-indigo-600 hover:text-white"
        onClick={onDelete}
      >
        <XIcon className="h-3 w-3" />
      </button>
      {showSkillRate && (
        <SkillRate
          wrapperWidth={widthWrapper}
          rate={rate}
          updateRate={updateSkillMutation.mutateAsync}
          isLoading={updateSkillMutation.isLoading}
        />
      )}
    </motion.div>
  );
}

interface SkillrateProps {
  wrapperWidth: number;
  rate: number;
  updateRate: UseMutateFunction<void, unknown, number, unknown>;
  isLoading: boolean;
}

function SkillRate({
  wrapperWidth,
  updateRate,
  rate,
  isLoading,
}: SkillrateProps) {
  const t = useTranslation();

  const handlerRate = async (rate: number) => {
    isLoading && toast.error(t("Rating is already being updated"));
    !isLoading && updateRate(rate);
  };
  return (
    <motion.div
      initial={{ opacity: 0, height: "0px" }}
      animate={{ opacity: 1, height: "35px" }}
      className=" absolute top-8 flex items-center space-x-2 py-2 pl-3 pr-2"
      style={{ right: "-10px", zIndex: 40 }}
    >
      <div
        className="relative flex items-center justify-center rounded-full bg-slate-100 p-1"
        style={{
          width: `${Number(wrapperWidth) ? `${wrapperWidth}px` : "auto"}`,
        }}
      >
        <svg
          aria-hidden="true"
          className={
            rate >= 1
              ? "delay-15 h-5 w-5 cursor-pointer text-yellow-400 transition duration-300 ease-in-out hover:scale-110 hover:text-yellow-500"
              : "hover:scale-11 h-5 w-5 cursor-pointer text-gray-300 transition duration-300 ease-in-out hover:scale-110 hover:text-gray-300 dark:text-gray-500"
          }
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => handlerRate(1)}
        >
          <title>First star</title>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        <svg
          aria-hidden="true"
          className={
            rate >= 2
              ? "delay-15 h-5 w-5 cursor-pointer text-yellow-400 transition duration-300 ease-in-out hover:scale-110 hover:text-yellow-500"
              : "hover:scale-11 h-5 w-5 cursor-pointer text-gray-300 transition duration-300 ease-in-out hover:scale-110 hover:text-gray-300 dark:text-gray-500"
          }
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => handlerRate(2)}
        >
          <title>Second star</title>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        <svg
          aria-hidden="true"
          className={
            rate >= 3
              ? "delay-15 h-5 w-5 cursor-pointer text-yellow-400 transition duration-300 ease-in-out hover:scale-110 hover:text-yellow-500"
              : "hover:scale-11 h-5 w-5 cursor-pointer text-gray-300 transition duration-300 ease-in-out hover:scale-110 hover:text-gray-300 dark:text-gray-500"
          }
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => handlerRate(3)}
        >
          <title>Third star</title>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        <svg
          aria-hidden="true"
          className={
            rate >= 4
              ? "delay-15 h-5 w-5 cursor-pointer text-yellow-400 transition duration-300 ease-in-out hover:scale-110 hover:text-yellow-500"
              : "hover:scale-11 h-5 w-5 cursor-pointer text-gray-300 transition duration-300 ease-in-out hover:scale-110 hover:text-gray-300 dark:text-gray-500"
          }
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => handlerRate(4)}
        >
          <title>Fourth star</title>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        <svg
          aria-hidden="true"
          className={
            rate >= 5
              ? "delay-15 h-5 w-5 cursor-pointer text-yellow-400 transition duration-300 ease-in-out hover:scale-110 hover:text-yellow-500"
              : "hover:scale-11 h-5 w-5 cursor-pointer text-gray-300 transition duration-300 ease-in-out hover:scale-110 hover:text-gray-300 dark:text-gray-500"
          }
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => handlerRate(5)}
        >
          <title>Fifth star</title>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        {isLoading && (
          <div
            className="absolute rounded-full bg-slate-100 p-1"
            style={{ right: "-20px" }}
          >
            <LoaderIcon />
          </div>
        )}
      </div>
    </motion.div>
  );
}
