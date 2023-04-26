import LeadCell from "components/calendar/week/lead/LeadCell";
import {
  format,
  formatISO,
  intervalToDuration,
  isSameDay,
  parseISO,
} from "date-fns";
import { useAppSelector } from "data/redux/store";
import merge from "components/formatting/merge";
import useLeadsQuery from "loading/queries/useLeadsQuery";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useWeekBounds } from "../WeekBoundsProvider";
import { CellContext } from "components/auth/CellProvider";
import {
  useLeadsTeam,
  useTrainersJoinedLead,
} from "supabase/trainer_lead.table";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import { useRole } from "components/auth/RoleProvider";
import { Lead } from "supabase/leads.table";
import { useHasuraAvailTrainersQuery } from "loading/queries/hasura";
import { checkExistedConflict } from "supabase/lead_conflict";
import classNames from "classnames";

interface DayColumnProps {
  date: Date;
  parentYRef: RefObject<HTMLDivElement>;
  cordinateYPosition: { id: number | null; date: Date | null }[];
  cordinateY: {
    id: number;
    y: number;
    index: number | null;
    date: Date | undefined | null;
  }[];
  eachDayInfo: {
    [key: string]: Lead[] | never[];
  };
  setCordinateY: Dispatch<
    SetStateAction<
      {
        id: number;
        y: number;
        index: number | null;
        date: Date | undefined | null;
      }[]
    >
  >;

  setEachDayInfo: Dispatch<
    SetStateAction<{
      [key: string]: Lead[] | never[];
    }>
  >;
  setCordinateYPosition: Dispatch<
    SetStateAction<{ id: number | null; date: Date | null }[]>
  >;
  setTeamLeads: Dispatch<SetStateAction<any[] | never[]>>;
  teamLeads: any[];
}

const DayColumn = ({
  date,
  parentYRef,
  setCordinateY,
  cordinateY,
  cordinateYPosition,
  setCordinateYPosition,
  setEachDayInfo,
  eachDayInfo,
  setTeamLeads,
  teamLeads,
}: DayColumnProps) => {
  const leadsQuery = useLeadsQuery();
  const cell = useAppSelector((state) => state.cell);
  const weekBounds = useWeekBounds();
  const dayColumnRef = useRef<HTMLDivElement>(null);
  const [columnWidth, setColumnWidth] = useState(206);
  const team = useLeadsTeam();
  const joined = useTrainersJoinedLead();
  const user = useSupabaseUser();
  const [leadsInfo, setLeadsInfo] = useState<any[]>([]);
  const [leadsData, setLeadsData] = useState<Lead[] | undefined>();
  const [brokenId, setBrokenId] = useState<number[]>([]);
  const [corYAllChilds, setCorYAllChilds] = useState([]);
  const cellContext = useContext(CellContext);

  const [findStartEventIndex, setFindStartEventIndex] = useState<
    ({ id: number; index: number | null; corY: number | null } | null)[]
  >([null]);
  const role = useRole();
  const slim = useAppSelector((state) => state.ui.slim);
  const leadRef = useRef(null);
  const checkDifferanceDay = (
    arrivalAt: string | undefined,
    departure: string | null | undefined
  ) => {
    return intervalToDuration({
      start: new Date(arrivalAt ?? 0),
      end: new Date(departure || (arrivalAt ?? 0)),
    }).days;
  };
  useEffect(() => {
    setLeadsData(leadsQuery.data);
  }, [leadsQuery.data]);
  useEffect(() => {
    const corY = cordinateYPosition
      .slice(1)
      .map((b) => {
        const a = cordinateY.find((a) => a.id === b.id);
        return a ? { id: a.id, index: a.index, corY: a.y } : null;
      })
      .filter((obj) => obj != null);
    setFindStartEventIndex(corY);
    return () => setFindStartEventIndex([null]);
  }, [cordinateYPosition]);
  useEffect(() => {
    setColumnWidth(dayColumnRef.current?.offsetWidth || 206);

    window.addEventListener("resize", (e) =>
      setColumnWidth(dayColumnRef.current?.offsetWidth || 206)
    );

    return () =>
      window.removeEventListener("resize", (e) =>
        setColumnWidth(dayColumnRef.current?.offsetWidth || 206)
      );
  }, []);

  const getDaysArray = function (
    start: string | number | Date,
    end: string | number | Date
  ) {
    let arr = [];
    for (
      let dt = new Date(start);
      dt <= new Date(end);
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt));
    }
    return arr;
  };

  const leads = useMemo(() => {
    let leads = leadsData?.map((lead) => {
      const differenceDate = getDaysArray(
        new Date(lead.arrival_at),
        new Date(lead.departure ?? lead.arrival_at)
      );
      const differenceDay = differenceDate
        .map((v) => formatISO(v, { representation: "date" }))
        .filter(
          (date) =>
            date >=
              formatISO(new Date(weekBounds.startTime), {
                representation: "date",
              }) &&
            date <=
              formatISO(new Date(weekBounds.endTime), {
                representation: "date",
              })
        );
      return { ...lead, difference: [...differenceDay] };
    });

    if (cellContext.assignedBy) {
      leads = leads?.filter((lead) => {
        let assigned = team.data?.map((team) => {
          if (lead.id === team.id_lead && team.id_trainers === user.id)
            return lead.id;
        });
        if (assigned?.includes(lead.id)) return lead;
      });
    }
    if (cellContext.appliedBy) {
      leads = leads?.filter((lead) => {
        let joinedPerson = joined.data?.map((join) => {
          if (lead.id === join.id_lead && join.id_trainer === user.id)
            return lead.id;
        });
        if (joinedPerson?.includes(lead.id)) return lead;
      });
    }

    if (cellContext.filterBy?.length && cellContext.filterBy.length > 0) {
      leads = leads?.filter((lead) =>
        cellContext.filterBy?.includes(lead?.subsystem || "")
      );
    }
    if (cellContext.statusBy?.length && cellContext.statusBy.length > 0) {
      leads = leads?.filter((lead) =>
        cellContext.statusBy?.includes(lead?.status || "")
      );
    }
    setColumnWidth(dayColumnRef.current?.offsetWidth || 206);

    if (cellContext.staffBy === "Staff") {
      leads = leads?.filter(
        (lead) =>
          lead.required_trainers_amount && lead.required_trainers_amount > 0
      );
    }
    if (cellContext.staffBy === "No Staff") {
      leads = leads?.filter(
        (lead) =>
          lead.required_trainers_amount === 0 ||
          lead.required_trainers_amount === null
      );
    }

    if (cellContext.sortBy) {
      leads?.sort((a, b) => {
        if (
          a.subsystem === cellContext.sortBy &&
          b.subsystem === cellContext.sortBy
        ) {
          return 0;
        } else if (b.subsystem === cellContext.sortBy) {
          return 1;
        } else {
          return -1;
        }
      });
    }
    findStartEventIndex.forEach((index) =>
      setBrokenId((current) => [...current, index?.id ? index?.id : 0])
    );

    return leads;
  }, [
    leadsQuery.data,
    cellContext.sortBy,
    cellContext.filterBy,
    cellContext.statusBy,
    cellContext.assignedBy,
    cellContext.staffBy,
    team.data,
    joined.data,
    leadsData,
    findStartEventIndex,
  ]);

  const loadingKeys = [0, 1, 2];

  const MultiplyLeadCell = leads
    ?.sort((a, b) => {
      if (a.subsystem === b.subsystem) {
        const locationA = merge(a.location, a.location_ev);
        const locationB = merge(b.location, b.location_ev);
        return locationA.localeCompare(locationB);
      } else return 0;
    })
    // ?.sort(
    //   (a, b) =>
    //     (checkDifferanceDay(b.arrival_at, b?.departure) ?? 0) - (checkDifferanceDay(a.arrival_at, a?.departure) ?? 0),
    // )
    // ?.sort(
    //   (a, b) =>
    //     (checkDifferanceDay(b.difference[0], b?.difference[b.difference.length - 1]) ?? 0) -
    //     (checkDifferanceDay(a.difference[0], a?.difference[b.difference.length - 1]) ?? 0),
    // )
    ?.sort((a, b) => {
      if (new Date(a.arrival_at) < new Date(b.arrival_at)) {
        return -1;
      } else if (new Date(a.arrival_at) === new Date(b.arrival_at)) {
        return 0;
      } else {
        return 1;
      }
    })
    // ?.sort((a, b) => {
    //   if (new Date(a.difference[0]) < new Date(b.difference[0])) {
    //     return -1;
    //   } else if (new Date(a.difference[0]) === new Date(b.difference[0])) {
    //     return 0;
    //   } else {
    //     return 1;
    //   }
    // })
    // ?.sort((a, b) => {
    //   if (a.difference.length > b.difference.length) {
    //     return 1;
    //   } else if (a.difference.length === b.difference.length) {
    //     return 0;
    //   } else {
    //     return -1;
    //   }
    // })
    ?.filter((lead) => {
      if ((!lead.special && role === "trainer") || role === "manager") {
        return lead;
      }
    })

    .map((lead, index, array) => {
      if (
        lead.difference.includes(formatISO(date, { representation: "date" }))
      ) {
        if (
          lead.difference.indexOf(
            formatISO(date, { representation: "date" })
          ) === 0 ||
          isSameDay(
            date,
            new Date(
              lead.difference.filter((day, index) => {
                if (
                  isSameDay(new Date(weekBounds.startTime), new Date(day)) &&
                  index > 0
                )
                  return day;
              })[0]
            )
          )
        ) {
          //first card
          // console.log("brokenId", brokenId, array, date);

          // if (array[index - 2//1]?.difference.length > lead.difference.length && brokenId.includes(array[index - 2//1]?.id)) {
          //   console.log(lead);
          // if (
          //   cordinateY?.find((corY) => corY.id === lead.id)?.y - 144 ===
          //   cordinateY?.find((corY) => corY.id === brokenId[1])?.y
          // )

          //   return (
          //     <>
          //       <div
          //         className={classNames("", {
          //           "h-[40px]": slim,
          //           "h-[140px]": !slim,
          //         })}
          //       ></div>
          //       <div ref={leadRef}>
          //         <LeadCell
          //           setEachDayInfo={setEachDayInfo}
          //           findStartEventIndex={findStartEventIndex}
          //           setCordinateY={setCordinateY}
          //           setCordinateYPosition={setCordinateYPosition}
          //           start={lead.difference.length > 1 ? true : false}
          //           // start
          //           key={index}
          //           cellId={lead.id}
          //           lead={lead}
          //           columnWidth={columnWidth}
          //           setLeadsInfo={setLeadsInfo}
          //           leadsInfo={leadsInfo}
          //           date={date}
          //         />
          //       </div>
          //     </>
          //   );
          // } else {

          return (
            <LeadCell
              setEachDayInfo={setEachDayInfo}
              findStartEventIndex={findStartEventIndex}
              setCordinateY={setCordinateY}
              setCordinateYPosition={setCordinateYPosition}
              start={lead.difference.length > 1 ? true : false}
              // start
              key={index}
              cellId={lead.id}
              lead={lead}
              columnWidth={columnWidth}
              setLeadsInfo={setLeadsInfo}
              leadsInfo={leadsInfo}
              date={date}
              setTeamLeads={setTeamLeads}
            />
          );
        } else if (
          lead.difference.indexOf(formatISO(date, { representation: "date" })) >
            0 &&
          lead.difference.indexOf(formatISO(date, { representation: "date" })) <
            lead.difference.length - 1
        ) {
          //middle cards

          return (
            <LeadCell
              setEachDayInfo={setEachDayInfo}
              findStartEventIndex={findStartEventIndex}
              cordinateY={cordinateY}
              setCordinateYPosition={setCordinateYPosition}
              setCordinateY={setCordinateY}
              parentCordinateY={parentYRef.current?.offsetTop}
              middle
              key={index}
              cellId={lead.id}
              lead={lead}
              columnWidth={columnWidth}
              setLeadsInfo={setLeadsInfo}
              leadsInfo={leadsInfo}
              date={date}
            />
          );
        } else if (
          lead.difference.indexOf(
            formatISO(date, { representation: "date" })
          ) ===
          lead.difference.length - 1
        ) {
          // last card

          return (
            <LeadCell
              setEachDayInfo={setEachDayInfo}
              findStartEventIndex={findStartEventIndex}
              last
              setCordinateYPosition={setCordinateYPosition}
              setCordinateY={setCordinateY}
              cordinateY={cordinateY}
              key={index}
              cellId={lead.id}
              lead={lead}
              columnWidth={columnWidth}
              setLeadsInfo={setLeadsInfo}
              leadsInfo={leadsInfo}
              date={date}
            />
          );
        }
      }
    });

  return (
    <div ref={dayColumnRef} className="relative bg-gray-50 p-1">
      {cell.draft &&
        cell.id === "new_cell" &&
        cell.draft.arrival_at &&
        isSameDay(parseISO(cell.draft.arrival_at), date) && (
          <LeadCell cellId={cell.id} lead={cell.draft as Lead} />
        )}
      {(leadsQuery.isLoading || !leadsQuery.data) &&
        loadingKeys.map((i, index) => <LeadCell key={index} />)}

      {MultiplyLeadCell}
    </div>
  );
};

export default DayColumn;
