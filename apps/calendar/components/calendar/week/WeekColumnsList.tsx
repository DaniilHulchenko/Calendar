import {
  eachDayOfInterval,
  format,
  formatISO,
  getDay,
  intervalToDuration,
  isFriday,
  isMonday,
  isSameDay,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday,
  parseISO,
  startOfWeek,
} from "date-fns";
import FullCalendar from "@fullcalendar/react";
import daygridPlugin from "@fullcalendar/daygrid";
import DayColumn from "./DayColumn";
import { useWeekBounds } from "../WeekBoundsProvider";
import useLeadsQuery from "loading/queries/useLeadsQuery";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "data/redux/store";
import { CellContext } from "components/auth/CellProvider";
import { LoaderIcon } from "react-hot-toast";
import { Lead } from "supabase/leads.table";
import { checkExistedConflict, insertLeadsConflictMutation, useLeadsConflictQuery } from "supabase/lead_conflict";
import merge from "components/formatting/merge";
import { useRole } from "components/auth/RoleProvider";
import LeadCell from "./lead/LeadCell";
import { EventSourceInput } from "@fullcalendar/core";
import { useLeadsTeam, useTrainersJoinedLead } from "supabase/trainer_lead.table";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import { divide } from "lodash";
import { useRouter } from "next/router";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { enUS } from "date-fns/locale";

const WeekColumnsList = () => {
  const weekBounds = useWeekBounds();
  const leadsQuery = useLeadsQuery();
  const cell = useAppSelector((state) => state.cell);
  const team = useLeadsTeam();
  const joined = useTrainersJoinedLead();
  const user = useSupabaseUser();

  const conflictedTrainer = useLeadsConflictQuery();

  const [teamLeads, setTeamLeads] = useState<any[] | never[]>([]);
  const cellContext = useContext(CellContext);
  const router = useRouter();

  const { mutate: inserConflictMutate } = insertLeadsConflictMutation();

  const days = eachDayOfInterval({
    start: weekBounds.startTime,
    end: weekBounds.endTime,
  });
  const inserConflict = async (values: { trainerId: string; leads: Lead[]; date: string | Date }[]) => {
    conflictedTrainer.refetch();
    inserConflictMutate(values);
  };
  let ids: string[] = [];
  let currentTrainer: string | null = null;

  let result = [];
  result = useMemo(() => {
    const result: any[] = [];
    teamLeads?.forEach((team: any, i, array) => {
      team.teamIds?.forEach((id: string) => {
        if (!ids.includes(id)) {
          ids.push(id);
        }
      });
    });
    let leadResult: any[] = [];
    ids.forEach((id: string) => {
      const result: any[] = teamLeads.filter((lead: Lead & { teamIds: any[] }) => {
        if (lead.teamIds.includes(id)) return lead;
      });
      const leadObj: {
        date: any;
        trainerId: string;
        leads: any[];
      } = { date: result[0].date, trainerId: id, leads: [] };
      result.forEach((lead: any) => {
        leadObj.leads.push(lead.leads);
      });
      currentTrainer = leadObj.trainerId;
      leadResult.push(leadObj);
    });
    return leadResult;
  }, [teamLeads]);

  if (result.length > 0 && currentTrainer) {
    inserConflict(result);
  }
  // -----------------------

  const role = useRole();
  const getDaysArray = function (start: string | number | Date, end: string | number | Date) {
    let arr = [];
    for (let dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt));
    }
    return arr;
  };
// Avoid multiple conditional assignments and return statements within the same block of code. Instead, you can combine the conditions and use a single return statement. This will make the code more concise and easier to read.
// Use array methods like map, filter, and reduce to manipulate the data instead of multiple nested loops.
  const events = useMemo(() => {
    let leads = leadsQuery.data?.map((lead) => {
    //Consider using a more descriptive variable name instead of generic names like leads or differenceDate to enhance code understanding.
      const differenceDate = getDaysArray(new Date(lead.arrival_at), new Date(lead.departure ?? lead.arrival_at));
    //Break down the logic into smaller functions or separate utility functions to improve code readability and reusability.
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
              }),
        );
      return { ...lead, difference: [...differenceDay] };
    });
//Break down the logic into smaller functions or separate utility functions to improve code readability and reusability.
    if (cellContext.assignedBy) {
      leads = leads?.filter((lead) => {
        let assigned = team.data?.map((team) => {
          if (lead.id === team.id_lead && team.id_trainers === user.id) return lead.id;
        });
        if (assigned?.includes(lead.id)) return lead;
      });
    }
    //Break down the logic into smaller functions or separate utility functions to improve code readability and reusability.
    if (cellContext.appliedBy) {
      leads = leads?.filter((lead) => {
        let joinedPerson = joined.data?.map((join) => {
          if (lead.id === join.id_lead && join.id_trainer === user.id) return lead.id;
        });
        if (joinedPerson?.includes(lead.id)) return lead;
      });
    }
//Break down the logic into smaller functions or separate utility functions to improve code readability and reusability.
    if (cellContext.filterBy?.length && cellContext.filterBy.length > 0) {
      leads = leads?.filter((lead) => cellContext.filterBy?.includes(lead?.subsystem || ""));
    }
    //Break down the logic into smaller functions or separate utility functions to improve code readability and reusability.
    if (cellContext.statusBy?.length && cellContext.statusBy.length > 0) {
      leads = leads?.filter((lead) => cellContext.statusBy?.includes(lead?.status || ""));
    }
    //Break down the logic into smaller functions or separate utility functions to improve code readability and reusability.
    if (cellContext.staffBy === "Staff") {
      leads = leads?.filter((lead) => lead.required_trainers_amount && lead.required_trainers_amount > 0);
    }
    //Break down the logic into smaller functions or separate utility functions to improve code readability and reusability.
    if (cellContext.staffBy === "No Staff") {
      leads = leads?.filter((lead) => lead.required_trainers_amount === 0 || lead.required_trainers_amount === null);
    }
//Break down the logic into smaller functions or separate utility functions to improve code readability and reusability.
    if (cellContext.sortBy) {
      leads?.sort((a, b) => {
        if (a.subsystem === cellContext.sortBy && b.subsystem === cellContext.sortBy) {
          return 0;
        } else if (b.subsystem === cellContext.sortBy) {
          return 1;
        } else {
          return -1;
        }
      });
    }
    //Don`t ue sort after sort(it`s useless)
    return leads
      ?.sort((a, b) => {
        if (a.subsystem === b.subsystem) {
          const locationA = merge(a.location, a.location_ev);
          const locationB = merge(b.location, b.location_ev);
          return locationA.localeCompare(locationB);
        } else return 0;
      })//Don`t ue sort after sort(it`s useless)
      ?.sort((a, b) => {
        if (new Date(a.arrival_at) < new Date(b.arrival_at)) {
          return -1;
        } else if (new Date(a.arrival_at) === new Date(b.arrival_at)) {
          return 0;
        } else {
          return 1;
        }
      })
      ?.filter((lead) => {
        if ((!lead.special && role === "trainer") || role === "manager") {
          return lead;
        }
      })
      .map((lead) => {
        return {
          ...lead,
          id: lead.id,
          title: lead.event_title || lead.contact_person || "",
          start: lead.arrival_at,
          end: lead.departure || lead.arrival_at,
          allDay: true,
        };
      });
  }, [
    // Remove dependices, That`s trigger function a lot of times
    leadsQuery.data,
    cellContext.sortBy,
    cellContext.filterBy,
    cellContext.statusBy,
    cellContext.assignedBy,
    cellContext.appliedBy,
    cellContext.staffBy,
    team.data,
    joined.data,
  ]);
  const loadingKeys = [0, 1, 2];
  useEffect(() => {
    cellContext.setUpdated?.(true);
    if (leadsQuery.data) {
      cellContext.setUpdated?.(false);
    }
  }, [leadsQuery.data]);
  const localizer = dateFnsLocalizer({
    format,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales: {
      "en-US": enUS,
    },
  });
  if (cellContext.updated) {
    return (
      <div className="relative h-[100vh] w-full bg-white p-1">
        <div className="absolute top-[50%] left-[50%] h-[200px] w-[200px]">
          <LoaderIcon />
        </div>
      </div>
    );
  }
  return (
    <>
      <div className=" calendar-week [&.fc-event]:  w-full shadow-md [&>*]:bg-white [&.fc-header-title]:text-black">
        <Calendar
          events={events}
          defaultView="week"
          localizer={localizer}
          startAccessor="start"
          endAccessor="end"
          showMultiDayTimes
          step={60}
          defaultDate={
            !Array.isArray(router.query.start) && router.query.start
              ? new Date(router.query.start)
              : new Date(weekBounds.startTime)
          }
          popup={false}
          components={{
            event: LeadCells,
          }}
        />
      </div>
    </>
  );
};
const LeadCells = (props: any) => {
  return <LeadCell cellId={props.event.id} lead={props.event} />;
};

export default WeekColumnsList;
