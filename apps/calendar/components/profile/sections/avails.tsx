import { RadioGroup } from "@headlessui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import dateToMonthInterval from "components/calendar/avail/dateToMonthInterval";
import { useTranslation } from "components/translation";
import {
  formatISO,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { motion } from "framer-motion";
import { Fragment, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Avail,
  selectAvailsByDates,
  useAvailsUpsertMutation,
} from "supabase/avails.table";
import TrainerAvailCalendar from "../../calendar/avail/TrainerAvailCalendar";
import { ProfileSection } from "../layout";
import { CheckIcon } from "@heroicons/react/outline";

function AvailSection() {
  const t = useTranslation();
  const { id: userId } = useSupabaseUser();

  const [selectedDays, setSelectedDays] = useState(() => [
    startOfDay(Date.now()),
  ]);

  return (
    <ProfileSection
      title={t("Availability")}
      description={t(
        "Describe your schedule when you are available or not for sure"
      )}
    >
      <div className="flex grow flex-wrap justify-center space-x-6 lg:flex-nowrap">
        <TrainerAvailCalendar
          trainerId={userId}
          monthDate={Date.now()}
          selectedDays={selectedDays}
          onSelectDays={setSelectedDays}
          paper
          className="w-60 sm:w-80"
        />

        <TrainerAvailSwitch className="grow" selectedDays={selectedDays} />
      </div>
    </ProfileSection>
  );
}

export default AvailSection;

function TrainerAvailSwitch({
  selectedDays,
  className,
}: {
  className?: string;
  selectedDays: Date[];
}) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { id: userId } = useSupabaseUser();

  const availsQuery = useQuery({
    queryKey: ["avails", userId, selectedDays],
    queryFn: () => selectAvailsByDates(userId, selectedDays),
  });

  const selectedAvails = useMemo(
    () =>
      selectedDays.map((selectedDay) =>
        availsQuery.data?.find((avail) =>
          compareByIsoDate(avail.date, selectedDay)
        )
      ),
    [availsQuery.data, selectedDays]
  );

  const { mutateAsync: upsertAvails, isLoading: isUpsertingAvails } =
    useAvailsUpsertMutation();

  const handleChange = useCallback(
    async (status: boolean) => {
      const { existingAvails, newAvails } = selectedDays.reduce<{
        existingAvails: Avail[];
        newAvails: Partial<Avail>[];
      }>(
        (group, selectedDay) => {
          const foundAvail = availsQuery.data?.find((avail) =>
            compareByIsoDate(avail.date, selectedDay)
          );

          if (foundAvail) {
            group.existingAvails.push({
              ...foundAvail,
              status,
            });
          } else {
            group.newAvails.push({
              trainer_id: userId,
              date: formatISO(selectedDay, { representation: "date" }),
              status,
            });
          }

          return group;
        },
        { existingAvails: [], newAvails: [] }
      );

      const updatedAvails = await upsertAvails(existingAvails);
      const createdAvails = await upsertAvails(newAvails);

      Array.from(new Set(selectedDays.map(startOfMonth))).forEach(
        (monthStart) => {
          const interval = dateToMonthInterval(monthStart);

          const intervalUpdatedAvails = updatedAvails.filter((avail) =>
            isWithinInterval(parseISO(avail.date), interval)
          );

          const intervalCreatedAvails = createdAvails.filter((avail) =>
            isWithinInterval(parseISO(avail.date), interval)
          );

          queryClient.setQueryData<Avail[]>(
            ["avails", userId, interval],
            (oldAvails = []) => {
              const oldUpdatedAvails = oldAvails.map((oldAvail) => {
                const updatedAvail = intervalUpdatedAvails.find(
                  (intervalAvail) => oldAvail.id === intervalAvail.id
                );

                return updatedAvail ? updatedAvail : oldAvail;
              });

              return [...oldUpdatedAvails, ...intervalCreatedAvails];
            }
          );
        }
      );

      const freshAvails = [...updatedAvails, ...createdAvails];

      queryClient.setQueryData(["avails", userId, selectedDays], freshAvails);

      for (const selectedDay of selectedDays) {
        queryClient.setQueryData(
          ["avails", userId, [selectedDay]],
          [
            freshAvails.find((avail) =>
              compareByIsoDate(avail.date, selectedDay)
            ),
          ]
        );
      }

      toast.success(t("Availability updated"));
    },
    [selectedDays, upsertAvails, queryClient, userId, t, availsQuery.data]
  );

  return (
    <section className={className}>
      <div className="mt-10 space-y-1 text-sm leading-6 text-gray-500">
        {availsQuery.isLoading ? (
          [...Array(2)].map((_, index) => (
            <div
              key={index}
              className="h-16 w-full animate-pulse rounded bg-gray-200"
            />
          ))
        ) : (
          <RadioGroup
            value={
              selectedAvails.every(
                (avail) => avail === undefined || avail.status
              )
                ? true
                : selectedAvails.every((avail) => avail?.status === false)
                ? false
                : undefined
            }
            disabled={isUpsertingAvails}
            className={classNames(isUpsertingAvails && "animate-pulse")}
            onChange={handleChange}
          >
            <RadioGroup.Label className="sr-only">
              {t("Availability")}
            </RadioGroup.Label>

            <div className="space-y-2">
              <AvailRadioOption
                label={t("Yes")}
                value={true}
                description={t("Freely available")}
                disabled={isUpsertingAvails}
              />

              <AvailRadioOption
                label={t("No")}
                value={false}
                description={t("Not Available / Holiday")}
                disabled={isUpsertingAvails}
              />
            </div>
          </RadioGroup>
        )}
      </div>
    </section>
  );
}

function compareByIsoDate(availDate: string, selectedDate: Date) {
  return availDate === formatISO(selectedDate, { representation: "date" });
}

function AvailRadioOption({
  label,
  value,
  description,
  disabled,
}: {
  label: string;
  value: boolean;
  description: string;
  disabled: boolean;
}) {
  return (
    <RadioGroup.Option
      value={value}
      disabled={disabled}
      className={({ checked }) =>
        classNames(
          checked
            ? `border-transparent ${value === true && "bg-indigo-500"} ${
                value === false && "bg-red-500"
              }`
            : "hover:shadow-lg",
          "relative flex cursor-pointer rounded-lg border px-5 py-4 transition focus:outline-none"
        )
      }
    >
      {({ checked }) => (
        <Fragment>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm">
                <RadioGroup.Label
                  className={classNames(
                    "font-medium transition",
                    checked ? "text-white" : "text-gray-900"
                  )}
                >
                  {label}
                </RadioGroup.Label>

                <RadioGroup.Description
                  className={classNames(
                    "transition",
                    checked ? "text-indigo-100" : "text-gray-500"
                  )}
                >
                  {description}
                </RadioGroup.Description>
              </div>
            </div>

            {checked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="shrink-0 text-white"
              >
                <CheckIcon className="h-6 w-6" />
              </motion.div>
            )}
          </div>
        </Fragment>
      )}
    </RadioGroup.Option>
  );
}
