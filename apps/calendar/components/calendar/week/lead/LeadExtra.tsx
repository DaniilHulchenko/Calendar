import merge from "components/formatting/merge";
import { CellId } from "data/redux/slices/cellSlice";
import { Lead, LeadTrainer } from "supabase/leads.table";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useMemo } from "react";
import { ThumbUpIcon } from "@heroicons/react/solid";
import Circle from "components/circles/Circle";
import TrainerAvatar from "components/circles/TrainerAvatar";
import { LeadProgramBlockList } from "components/program-block";
import { useRole } from "components/auth/RoleProvider";
import classNames from "classnames";
import { useLeadTeam, useTrainersJoin } from "supabase/trainer_lead.table";
import { useHasuraTrainersQuery } from "loading/queries/hasura";
import ProfileAvatar from "components/layout/ProfileAvatar";

const LeadExtra = ({ cellId, lead }: { cellId: CellId | undefined; lead: Partial<Lead> | undefined }) => {
    const router = useRouter();
    const joinedTrainers = useTrainersJoin(cellId ? +cellId : 0);
    const location = merge(lead?.location, lead?.location_ev);
    const trainersQuery = useHasuraTrainersQuery("");
    const acceptedTrainers = useLeadTeam(cellId ? +cellId : 0);
    const trainers = useMemo(() => {
        const result: {
            termiante: any;
            id: string;
            about_me?: string | undefined;
            driving_license: boolean;
            dlrg_certificate: boolean;
            profile: any;
            trainer_skills: any;
            accepted?: boolean | undefined;
        }[] = [];
        trainersQuery.data?.forEach((trainer) => {
            const acceptedId = acceptedTrainers.data?.filter((acceptedTrainer) => {
                if (acceptedTrainer.accepted && acceptedTrainer.id_profiles === trainer.id)
                    return {
                        id: acceptedTrainer.id_profiles,
                        terminate: acceptedTrainer.termiante,
                    };
            });
            if (acceptedId && acceptedId[0]?.id_profiles === trainer.id) {
                result.push({ ...trainer, termiante: acceptedId[0]?.terminate });
            }
        });
        return result;
    }, [trainersQuery.data, acceptedTrainers.data]);

    /** @todo get from DB */
    const leadTrainers: LeadTrainer[] = [];

    const leader = leadTrainers.find((trainer) => trainer.leader);

    const role = useRole();
    const isManager = role === "manager" ? true : false;

    const circlesNumber = lead?.required_trainers_amount && lead.required_trainers_amount - leadTrainers.length;
    const currentSubSystem = lead?.subsystem;
    return (
        <Fragment>
            <div className="flex items-center p-1">
                <div className="grow truncate text-black" title={location}>
                    {!cellId ? <div className="h-4 w-full animate-pulse rounded bg-gray-200" /> : location}
                </div>

                <div className="ml-1 min-w-[22px] shrink-0 text-xs font-semibold text-gray-900/50 transition hover:text-indigo-500 hover:underline">
                    {!cellId ? (
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    ) : (
                        <Link
                            href={{
                                query: {
                                    ...router.query,
                                    cellId: cellId,
                                    tab: "bewerbung",
                                },
                            }}
                        >
                            <a className="flex items-center gap-1">
                                <ThumbUpIcon className="h-3 w-3" />
                                {isManager && (
                                    <span>
                                        {joinedTrainers.data?.length && joinedTrainers.data?.length > 0 ? joinedTrainers.data?.length : 0}
                                    </span>
                                )}
                            </a>
                        </Link>
                    )}
                </div>
            </div>

            <div className="relative flex items-center p-1">
                <div className="flex grow -space-x-1 p-1">
                    {!cellId && Array.from(Array(3).keys()).map((key) => <Circle key={key} skeleton />)}

                    {leader && <TrainerAvatar {...leader} />}

                    {leadTrainers
                        .filter((trainer) => !trainer.leader)
                        .map((trainer) => (
                            <TrainerAvatar key={trainer.id} {...trainer} />
                        ))}

                    {circlesNumber &&
                        circlesNumber > 0 &&
                        Array.from(Array(circlesNumber).keys()).map((key, index) => {
                            // ProfileAvatar;
                            if (trainers[index]?.profile) {
                                return (
                                    <button
                                        key={key}
                                        className={classNames(
                                            "z-0 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white text-xs font-semibold text-white ring-4  transition",
                                            { "ring-red-400": trainers[index].termiante },
                                        )}
                                    >
                                        <div className=" h-[40px] w-auto">
                                            <ProfileAvatar url={trainers[index]?.profile?.avatar?.url} small />;
                                        </div>
                                    </button>
                                );
                            } else {
                                return (
                                    <Circle
                                        key={key}
                                        className="ring-gray-300"
                                        backgroundColor={
                                            currentSubSystem === "GmbH"
                                                ? "bg-white"
                                                : currentSubSystem === "e.V."
                                                    ? "bg-emerald-100"
                                                    : currentSubSystem === "Ausbildung"
                                                        ? "bg-blue-100"
                                                        : "bg-gray-200"
                                        }
                                    />
                                );
                            }
                        })}
                </div>

                <div
                    className={classNames("absolute right-0 top-0 bottom-0 flex items-center", {
                        "bg-white": currentSubSystem === "GmbH",
                        "bg-emerald-100": currentSubSystem === "e.V.",
                        "bg-blue-100": currentSubSystem === "Ausbildung",
                    })}
                >
                    <div
                        className={classNames("bg-gradient-to- absolute top-0 -left-5 bottom-0 w-5", {
                            "bg-white": currentSubSystem === "GmbH",
                            "bg-emerald-100": currentSubSystem === "e.V.",
                            "bg-blue-100": currentSubSystem === "Ausbildung",
                        })}
                    ></div>
                </div>
            </div>

            {cellId && cellId !== "new_cell" && (
                <LeadProgramBlockList leadId={cellId} programBlockNames={lead?.program_block_names} />
            )}
        </Fragment>
    );
};

export default LeadExtra;