import { UsersIcon } from "@heroicons/react/outline";
import { Fragment, useEffect, useState } from "react";
import TrainerListItem from "components/trainers/TrainerListItem";
import SearchControl from "components/form/SearchControl";
import DefaultLayout from "ui/layout/DefaultLayout";
import ListLayout from "ui/layout/list/ListLayout";
import InfoBlock from "ui/InfoBlock";
import { HasuraTrainer, useHasuraTrainersQuery } from "loading/queries/hasura";
import { useTranslation } from "components/translation";
import { motion } from "framer-motion";
import ProfileAvatar from "components/layout/ProfileAvatar";
import { MailIcon, PhoneIcon } from "@heroicons/react/solid";
import Badge from "components/layout/Badge";
import TrainerAvailCalendar from "components/calendar/avail/TrainerAvailCalendar";
import { DefaultCombobox } from "components/combobox";
import classNames from "classnames";
import { useTrainers } from "supabase/trainers.table";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";

const TrainersPage = () => {
  const t = useTranslation();
  const [selectedTrainer, setSelectedTrainer] = useState<any>();
  const [term, setTerm] = useState<string>("");
  const user = useSupabaseUser();
  const trainersQuery = useTrainers(selectedTrainer?.id || user.id);
  useEffect(() => {
    if (!trainersQuery.data?.find((trainer: any) => trainer.id === selectedTrainer?.id)) {
      trainersQuery.data && setSelectedTrainer(trainersQuery.data[0]);
    }
  }, [selectedTrainer?.id, trainersQuery.data]);

  return (
    <DefaultLayout icon={<UsersIcon />} title={t("Trainers")} description={t("Find the right trainers")}>
      <div className="mb-[-40px] block py-2 px-4 lg:hidden">
        <DefaultCombobox
          label={t("Search trainers")}
          srLabel
          placeholder={t("Search for trainers")}
          onChange={setTerm}
          onSelect={(optionSkill: any) => {
            if (!optionSkill) {
              return;
            } else {
              trainersQuery.data?.map((trainer: any) => {
                if (trainer.id === optionSkill) {
                  setSelectedTrainer(trainer);
                }
              });
            }
          }}
        >
          {trainersQuery.data?.map((trainer: any) => {
            return (
              <DefaultCombobox.Option key={trainer.id} value={trainer.id}>
                {trainer.profiles?.name ? trainer.profiles?.name : trainer.profiles?.user.email}
              </DefaultCombobox.Option>
            );
          })}

          {trainersQuery.isLoading && (
            <Fragment>
              {[...Array(6)].map((_, index) => {
                const part = index % 3;

                return (
                  <DefaultCombobox.Message key={index}>
                    <div className={classNames("h-4 animate-pulse rounded bg-gray-200", part > 0 && `w-${part}/3`)} />
                  </DefaultCombobox.Message>
                );
              })}
            </Fragment>
          )}
        </DefaultCombobox>
      </div>
      <ListLayout
        tools={
          <div className="hidden lg:block">
            <SearchControl
              label={t("Search")}
              placeholder={t("Search for trainer")}
              className="w-[344px]"
              onChange={(event) => setTerm(event.target.value.trim())}
            />
          </div>
        }
        responsive
        items={
          <div className="hidden lg:block">
            <Fragment>
              {trainersQuery.isLoading &&
                Array.from(Array(3).keys()).map((i) => <TrainerListItem key={i} skeleton={true} />)}
              {trainersQuery.data?.length === 0 && (
                <li>
                  <InfoBlock>{t("No trainers found")}</InfoBlock>
                </li>
              )}

              {trainersQuery.data?.map((trainer: any) => (
                <TrainerListItem
                  key={trainer.id}
                  trainer={trainer}
                  selected={trainer.id === selectedTrainer?.id}
                  onClick={() => setSelectedTrainer(trainer)}
                />
              ))}
            </Fragment>
          </div>
        }
      >
        {!selectedTrainer && !trainersQuery.isLoading && trainersQuery.data && trainersQuery.data.length > 0 && (
          <InfoBlock>{t("Choose a trainer")}</InfoBlock>
        )}
        {selectedTrainer && <TrainerProfile key={selectedTrainer.id} trainer={selectedTrainer} />}
      </ListLayout>
    </DefaultLayout>
  );
};

export default TrainersPage;

/** @todo provide loading state */
const TrainerProfile = ({ trainer }: { trainer: any }) => {
  const t = useTranslation();
  console.log(trainer);

  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "just" }}
      className="w-full divide-y"
    >
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <motion.div className="shrink-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <ProfileAvatar url={trainer.avatars.url} skeleton={false} />
        </motion.div>

        <div>
          {trainer.profiles?.name && (
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-semibold">
              {trainer.profiles?.name}
            </motion.h2>
          )}

          <motion.a
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "just" }}
            // href={`mailto:${trainer.profiles?.user.email}`}
            className="flex flex-wrap items-center gap-2 py-2 text-sm text-gray-500 hover:underline sm:text-lg"
          >
            {/* <MailIcon className="h-5 w-5" />
            {trainer.profiles?.user.email} */}
          </motion.a>

          {trainer.profiles?.contact && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "just" }}
              className="flex items-center gap-2 py-2 text-gray-500"
            >
              <PhoneIcon className="h-5 w-5" />
              {trainer.profiles?.contact}
            </motion.p>
          )}
        </div>
      </div>

      {(trainer.about_me || trainer.driving_license || trainer.dlrg_certificate) && (
        <section className="space-y-6 py-6">
          {trainer.about_me && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-lg"
            >
              <h3 className="text-xl font-semibold">{t("About me")}</h3>
              <p>{trainer.about_me}</p>
            </motion.div>
          )}

          {(trainer.driving_license || trainer.dlrg_certificate) && (
            <div className="flex space-x-2">
              {trainer.driving_license && (
                <Badge initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  {t("Driving license")}
                </Badge>
              )}

              {trainer.dlrg_certificate && (
                <Badge initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  {t("DLRG certificate")}
                </Badge>
              )}
            </div>
          )}
        </section>
      )}

      {trainer.trainer_skills?.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="py-6">
          <h3 className="text-xl font-semibold">{t("Skills")}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {trainer.trainer_skills?.map((trainerSkill: any) => {
              return (
                <Badge key={trainerSkill.id} className="max-w-[12em] truncate">
                  {trainerSkill.name}
                </Badge>
              );
            })}
          </ul>
        </motion.section>
      )}

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="py-6">
        <h3 className="text-xl font-semibold">{t("Availability")}</h3>

        <TrainerAvailCalendar className="mt-2" trainerId={trainer.id} monthDate={Date.now()} />
      </motion.section>
    </motion.div>
  );
};
