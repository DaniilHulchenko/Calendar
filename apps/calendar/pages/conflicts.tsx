import {
  ArchiveIcon,
  BanIcon,
  ExclamationIcon,
  ExternalLinkIcon,
  SaveIcon,
} from "@heroicons/react/outline";
import ProfileAvatar from "components/layout/ProfileAvatar";
import { useTranslation } from "components/translation";
import { useRefactorConflict } from "hooks/useRefactorConflicts";
import { HasuraTrainer, useHasuraTrainersQuery } from "loading/queries/hasura";
import React, { useMemo, useState } from "react";
import {
  LeadConflict,
  createLeadConflictName,
  terminateTrainer,
  useLeadsConflictQuery,
} from "supabase/lead_conflict";
import DefaultLayout from "ui/layout/DefaultLayout";
import Link from "next/link";
import { WorkspacePopover } from "components/layout";
import { SubmitButton } from "components/formik";
import Button from "ui/buttons/Button";
import DefaultDialogButtons from "ui/dialog/DefaultDialogButtons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { LoaderIcon } from "react-hot-toast";
import { format } from "date-fns";
import { useRole } from "components/auth/RoleProvider";
import { useRouter } from "next/router";

export default function Conflicts() {
  const role = useRole();
  const router = useRouter();

  const t = useTranslation();

  const [value, setValue] = useState<string>();
  const [currentTrainer, setCurrentTrainer] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string | Date>("");
  const [updateData, setUpdateData] = useState(false);

  const conflicted = useLeadsConflictQuery();
  const queryClient = useQueryClient();
  const trainersQuery = useHasuraTrainersQuery("");

  const termianteTrainerMutation = useMutation({
    mutationFn: terminateTrainer,
    onSuccess: (updatedConflicted: any) => {
      conflicted.refetch();
      trainersQuery.refetch();
      toast.success(t("Trainer terminated"));
      setUpdateData(false);

      return updatedConflicted;
    },
    onError: () => {
      toast.error(t("Something went wrong"));
      setUpdateData(false);
    },
  });

  function combineArrays(arrayA: LeadConflict[], arrayB: HasuraTrainer[]) {
    // Create a new array to hold the combined data
    const combinedArray = [];
    // Loop through all objects in arrayA
    for (let i = 0; i < arrayA.length; i++) {
      const objA = arrayA[i];
      // Find the matching object in arrayB based on trainer_id
      const objB = arrayB.find((b) => b.id === objA.trainer_id);
      // Create a new object with data from both objects
      const combinedObj = { ...objA, trainer: objB };
      // Add the new object to the combined array
      combinedArray.push(combinedObj);
    }
    return combinedArray;
  }
  const refactoredConflicted = useMemo(() => {
    if (conflicted.data && trainersQuery.data) {
      return combineArrays(conflicted.data, trainersQuery.data).filter(
        (conflicte) => !conflicte.isIgnore
      );
    }
  }, [conflicted.data, trainersQuery.data]);

  if (role === "trainer") {
    router.push("/");
  }

  if (updateData) {
    return (
      <div>
        <LoaderIcon />
      </div>
    );
  } else {
    return (
      <DefaultLayout
        icon={<BanIcon />}
        title={t("HR Conflicts")}
        description={t("Look at the conflicts of all leads")}
      >
        <div className="container mx-auto min-h-full px-4 sm:px-8">
          <div className="py-8">
            <div className="-mx-4 overflow-x-auto px-4 py-4 sm:-mx-8 sm:px-8">
              <div className="inline-block min-w-full overflow-hidden rounded-lg shadow-md">
                <table className="min-w-[605px] overflow-scroll leading-normal md:min-w-full">
                  <thead>
                    <tr>
                      <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        {t("Trainers")}
                      </th>
                      <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        {t("Conflicted Leads")}
                      </th>
                      <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        {t("Date")}
                      </th>
                      <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {refactoredConflicted?.length === 0 && (
                      <tr>
                        <td className="flex flex-col items-center justify-center py-6 text-indigo-500">
                          {`${t(
                            "No conflicts were found"
                          )}                        `}
                          <div className="h-20 w-20">
                            <ArchiveIcon color="text-indigo-400" />
                          </div>
                        </td>
                      </tr>
                    )}
                    {refactoredConflicted?.map((conflictedInfo) => {
                      if (conflictedInfo?.leads_id.length > 1)
                        return (
                          <tr key={conflictedInfo?.id}>
                            <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                              <div className="flex">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <ProfileAvatar
                                    skeleton={conflicted.isLoading}
                                    small
                                    url={
                                      conflictedInfo?.trainer?.profile?.avatar
                                        ?.url
                                    }
                                    className="h-full w-full rounded-full"
                                  />
                                </div>
                                <div className="ml-3">
                                  <p className="whitespace-no-wrap text-gray-900">
                                    {conflictedInfo?.trainer?.profile?.name ||
                                      conflictedInfo?.trainer?.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="row-g border-t border-gray-200 bg-white px-5 py-5 text-sm">
                              <div className="flex flex-col gap-[40px]">
                                {conflictedInfo?.leads_id.length > 1 &&
                                  conflictedInfo?.leads_id?.map(
                                    (lead, index) => {
                                      return (
                                        <p
                                          key={index}
                                          className="whitespace-no-wrap text-gray-900"
                                        >
                                          {JSON.parse(lead)?.leads
                                            ?.customer_name ||
                                            JSON.parse(lead)?.customer_name}
                                        </p>
                                      );
                                    }
                                  )}
                              </div>
                            </td>
                            <td className="border-t border-gray-200 bg-white px-5 py-5 text-sm">
                              <div className="flex flex-col gap-[20px]">
                                {conflictedInfo?.leads_id.length > 1 &&
                                  conflictedInfo?.leads_id?.map(
                                    (lead, index) => {
                                      return (
                                        <div
                                          key={index}
                                          className="border-b border-gray-200 last:border-b-[0px]"
                                        >
                                          <p className="whitespace-no-wrap text-gray-900">
                                            {t("Arrival At")}:{" "}
                                            {format(
                                              new Date(
                                                JSON.parse(lead)?.leads
                                                  ?.arrival_at ||
                                                  JSON.parse(lead)?.arrival_at
                                              ),
                                              "dd.MM.yyyy"
                                            )}
                                          </p>
                                          <p className="whitespace-no-wrap text-gray-600">
                                            {t("Departure")}:{" "}
                                            {format(
                                              new Date(
                                                JSON.parse(lead)?.leads
                                                  ?.departure ||
                                                  JSON.parse(lead)?.departure
                                              ),
                                              "dd.MM.yyyy"
                                            )}
                                          </p>
                                        </div>
                                      );
                                    }
                                  )}
                              </div>
                            </td>
                            <td className="border-b border-gray-200 bg-white px-5 py-5 text-right text-sm">
                              <WorkspacePopover
                                showWorkSpace
                                description={"Where terminate trainer"}
                                button={
                                  <div
                                    onClick={(e) => {
                                      setCurrentTrainer(
                                        conflictedInfo.trainer_id
                                      );
                                      setCurrentDate(conflictedInfo.date);
                                      setValue("");
                                    }}
                                    className="inline-block cursor-pointer text-gray-500 hover:text-gray-700"
                                  >
                                    <svg
                                      className="inline-block h-6 w-6 fill-current"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z" />
                                    </svg>
                                  </div>
                                }
                                content={() => (
                                  <>
                                    <div className="flex flex-col items-center space-x-4 p-4">
                                      <div className="w-[230px]">
                                        <p className="font-bold">Leads</p>
                                        {conflictedInfo?.leads_id.length > 1 &&
                                          conflictedInfo?.leads_id?.map(
                                            (lead, index) => {
                                              return (
                                                <>
                                                  <div
                                                    key={index}
                                                    className="divide-y"
                                                  >
                                                    <label className="flex cursor-pointer items-start space-x-3 py-2">
                                                      <input
                                                        type="radio"
                                                        name="lead"
                                                        onChange={(e) =>
                                                          setValue(
                                                            e.target.value
                                                          )
                                                        }
                                                        value={
                                                          JSON.parse(lead)
                                                            ?.leads?.id ||
                                                          JSON.parse(lead)?.id
                                                        }
                                                        className="h-5 w-5 rounded border-gray-300"
                                                      />

                                                      <div className="flex flex-col">
                                                        <span className="leading-none text-gray-700">
                                                          {JSON.parse(lead)
                                                            ?.leads
                                                            ?.customer_name ||
                                                            JSON.parse(lead)
                                                              ?.customer_name}
                                                        </span>
                                                      </div>
                                                    </label>
                                                  </div>
                                                </>
                                              );
                                            }
                                          )}
                                        <div>
                                          <label className="flex cursor-pointer items-start space-x-3 py-2">
                                            <input
                                              type="radio"
                                              name="lead"
                                              onChange={(e) =>
                                                setValue("ignore")
                                              }
                                              value={"Ignore"}
                                              className="h-5 w-5 rounded border-gray-300"
                                            />
                                            <div className="flex flex-col">
                                              <span className="leading-none text-gray-700">
                                                {t("Ignore")}
                                              </span>
                                            </div>
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={
                                        "flex items-center justify-center gap-3 bg-gray-100 px-6 py-4"
                                      }
                                    >
                                      <Button
                                        onClick={() => {
                                          let filtered =
                                            conflictedInfo.leads_id.filter(
                                              (lead) => {
                                                lead = JSON.parse(lead);
                                                if (
                                                  value &&
                                                  +lead.id !== +value
                                                )
                                                  return lead;
                                              }
                                            );
                                          value &&
                                            termianteTrainerMutation.mutate({
                                              leadId: value,
                                              trainerId: currentTrainer,
                                              updatedLeads: filtered.flat(),
                                              date: currentDate,
                                            });
                                          setUpdateData(true);
                                        }}
                                        type="submit"
                                        icon={<SaveIcon />}
                                        variant="contained"
                                      >
                                        {t("Terminate")}
                                      </Button>
                                    </div>
                                  </>
                                )}
                              />
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }
}
