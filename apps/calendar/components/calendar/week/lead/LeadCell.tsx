import { ThumbUpIcon, UsersIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import { usePanel } from "components/panel/PanelProvider";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAppDispatch, useAppSelector } from "data/redux/store";
import AvatarCircle from "../../../circles/AvatarCircle";
import cellSlice, { CellId } from "data/redux/slices/cellSlice";
import { motion } from "framer-motion";
import { Lead, LeadTrainer } from "supabase/leads.table";
import LeadExtra from "./LeadExtra";
import { useTimeout } from "hooks/useTimeout";

import { useLeadTeam } from "supabase/trainer_lead.table";
import { useRole } from "components/auth/RoleProvider";
import { useWeekBounds } from "components/calendar/WeekBoundsProvider";
import { formatISO, isFriday, isMonday, isSaturday, isSunday, isThursday, isTuesday, isWednesday } from "date-fns";
import { CellContext } from "components/auth/CellProvider";

interface LeadCellProps {
    cellId?: CellId;
    lead?: Lead;
    middle?: boolean;
    last?: boolean;
    start?: boolean;
    findStartEventIndex?: any[];
    cordinateY?: {
        id: number;
        y: number;
        index: number | null;
        date: Date | undefined | null;
    }[];
    setCordinateY?: Dispatch<any>;
    parentCordinateY?: number;
    columnWidth?: number;
    date?: Date;
    leadsInfo?: { leadId: string; cordinateY: number; role: string }[];
    setLeadsInfo?: Dispatch<any>;
    setCordinateYPosition?: Dispatch<SetStateAction<{ id: number | null; date: Date | null }[]>>;
    setEachDayInfo?: Dispatch<
        SetStateAction<{
            [key: string]: Lead[] | never[];
        }>
    >;
    leadsTeam?: any[];
    setTeamLeads?: Dispatch<SetStateAction<any[] | never[]>> | undefined;
}

const LeadCell = ({
    cellId,
    findStartEventIndex,
    lead,
    middle,
    last,
    start,
    setCordinateY,
    cordinateY,
    columnWidth,
    leadsInfo,
    setLeadsInfo,
    setCordinateYPosition,
    setEachDayInfo,
    date,
    setTeamLeads,
}: // leadsTeam,
    LeadCellProps) => {
    const dispatch = useAppDispatch();
    const cellContext = useContext(CellContext);
    const slim = cellContext.slim;
    const cell = useAppSelector((state) => state.cell);
    // const cellContext = useContext(CellContext);
    const { show, open } = usePanel();
    const cellRef = useRef<HTMLDivElement>(null);
    const prevDraftArrival = useRef<string>();
    const router = useRouter();
    const role = useRole();
    const isManager = role === "manager" ? true : false;
    const team = useLeadTeam(lead?.id || 0);

    const weekBounds = useWeekBounds();

    let idsOfTeam = team.data?.map((teamId) => teamId.id_profiles);
    let leadsTeam: any[] = [];
    useEffect(() => {
        if (leadsTeam) {
            let newLeadTeam: any[] = [
                {
                    leadId: cellId !== undefined ? +cellId : 0,
                    leads: lead,
                    teamIds: idsOfTeam,
                    date: date,
                },
            ];
            setTeamLeads?.((current: any[]) => [...current, newLeadTeam[0]]);
            return () => setTeamLeads?.([]);
        }
    }, [team.data]);

    const updatePanelReference = useCallback(() => {
        if (!cellRef.current) {
            throw new Error("A cell reference is not set.");
        }

        show(cellRef.current);
    }, [show]);

    useEffect(() => {
        if (cellId && cell.id === cellId && !open) {
            updatePanelReference();
        }
    }, [updatePanelReference, open, cell.id, cellId]);

    useEffect(() => {
        if (!cellId || !lead) {
            return;
        }

        if (
            cell.id === cellId &&
            open &&
            (cell.draft?.arrival_at !== prevDraftArrival.current || cell.draft?.arrival_at !== lead.arrival_at)
        ) {
            updatePanelReference();
        }

        prevDraftArrival.current = cell.draft?.arrival_at;
    }, [cell.draft?.arrival_at, cell.id, open, cellId, lead, updatePanelReference]);

    useEffect(() => {
        if (typeof router.query.cellId === "string" && cellId && cellId === Number.parseInt(router.query.cellId)) {
            dispatch(cellSlice.actions.selectLead(cellId));
            updatePanelReference();
        }
    }, [dispatch, cellId, router.query, updatePanelReference]);

    const selectLead = () => {
        return router.replace({
            query: {
                ...router.query,
                cellId: cellId,
                day: formatISO(date || new Date(), { representation: "date" }),
            },
        });
    };
    const { clear, set, stillHover } = useTimeout(300);
    useEffect(() => {
        if (stillHover) {
            selectLead();
        }
    }, [stillHover]);

    const currentSubSystem = lead?.subsystem;
    const hqStatusesOpen = ["Erstkontakt / Interesse", "Konkrete Anfrage", "Angebot", "Open"];
    const hqStatusesSuccessful = ["Erfolgreich", "Successful"];
    const hqStatusesUnsuccessful = [
        "Absage / Zu kleines Budget",
        "Absage / Zu teuer",
        "Absage / VA wird verschoben",
        "Absage / interne Absage der VA",
        "Absage / Alle EXEO-Programmbausteine bekannt",
        "Absage / Anderer Anbieter",
        "Absage / Keine Rückmeldung",
        "Absage / keine Kapazitäten EXEO",
        "Absage / Kein Interesse_keine Akquise",
        "Absage / Sonstiges",
        "Storno",
        "Unsuccessful",
    ];

    useEffect(() => {
        cellContext.correctRender?.(!cellContext.slim);
    }, []);
    console.log("currentSubSystem", currentSubSystem);

    return (
        <motion.div
            ref={cellRef}
            className={classNames(
                "rounde transitio relative  mt-2 overflow-hidden rounded-md bg-gray-200	 text-xs shadow-md", //w-screen
                {
                    "rounded-l-lg": start,
                    "rounded-r-lg": last,
                    "bg-white": currentSubSystem === "GmbH",
                    "bg-emerald-100": currentSubSystem === "e.V.",
                    "bg-blue-100": currentSubSystem === "Ausbildung",
                },
            )}
            id={cellId?.toString()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: !cellId ? 1 : 0 }}
            style={{
                backgroundColor: `${lead?.special && "#ff6666"}`,
            }}
        >
            {middle && (
                <div
                    className={classNames({
                        "h-[136px]": !slim,
                        "h-[40px]": slim,
                    })}
                ></div>
            )}

            {!middle && !last && (
                <div className="flex items-center p-1">
                    <AvatarCircle
                        name={lead?.contact_person}
                        className={classNames("m-1 flex-shrink-0", {
                            "ring-yellow-500": hqStatusesOpen.includes(lead?.status || "NotSet"),
                            "ring-green-500": hqStatusesSuccessful.includes(lead?.status || "NotSet"),
                            "ring-red-500": hqStatusesUnsuccessful.includes(lead?.status || "NotSet"),
                        })}
                        skeleton={!cellId}
                    />

                    <div className="ml-2 grow truncate font-semibold text-black transition">
                        {!cellId ? (
                            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                        ) : (
                            <div>
                                <div className="hover:text-indigo-500 hover:underline">
                                    <Link
                                        href={{
                                            query: {
                                                ...router.query,
                                                cellId: cellId,
                                                day: formatISO(date || new Date(), {
                                                    representation: "date",
                                                }),
                                            },
                                        }}
                                    >
                                        <a title={lead?.customer_name} onMouseOver={set} onMouseLeave={clear}>
                                            {lead?.customer_name}
                                        </a>
                                    </Link>
                                </div>
                                <div className="flex gap-1 font-normal text-slate-800">
                                    {lead?.automobile
                                        ? lead?.required_language === "German"
                                            ? "G "
                                            : lead?.required_language === "English"
                                                ? "E "
                                                : " "
                                        : lead?.required_language}
                                    <div className=" cursor-pointer text-xs font-semibold text-gray-900/50 hover:text-indigo-500 hover:underline">
                                        {!cellContext.updated && <span>{lead?.automobile}</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="ml-1 min-w-[42px] shrink-0 text-xs font-semibold text-green-500 transition hover:text-indigo-500 hover:underline">
                        {!cellId ? (
                            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                        ) : (
                            <Link
                                href={{
                                    query: { ...router.query, cellId: cellId, tab: "team" },
                                }}
                            >
                                <a className="flex items-center gap-1">
                                    <UsersIcon className="h-3 w-3" />
                                    <span>
                                        {Array.isArray(team?.data) && team.data.length > 0 ? (
                                            <span>{team.data?.length}</span>
                                        ) : (
                                            <span>0</span>
                                        )}
                                    </span>
                                    /<span>{`${lead?.required_trainers_amount || "-"}`}</span>
                                </a>
                            </Link>
                        )}
                    </div>
                </div>
            )}
            {!slim && !middle && !last && <LeadExtra cellId={cellId} lead={lead} />}
            {last && (
                <div
                    className={classNames({
                        "h-[136px]": !slim,
                        "h-[40px]": slim,
                    })}
                ></div>
            )}
        </motion.div>
    );
};

export default LeadCell;
