import { useRole } from "components/auth/RoleProvider";
import { useWeekBounds } from "components/calendar/WeekBoundsProvider";
import { useTranslation } from "components/translation";
import { useAppDispatch, useAppSelector } from "data/redux/store";
import useLeadsQuery from "loading/queries/useLeadsQuery";
import { useRouter } from "next/router";
import { ReactNode, useContext, useEffect, useState } from "react";
import { useWeekSyncQuery } from "supabase/week_syncs.table";
import MultiSwitch, { MultiSwitchOption } from "ui/MultiSwitch";
import CheckBox from "ui/CheckBox";
import ReactDOM from "react-dom";
import {
  AdjustmentsIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewGridAddIcon,
} from "@heroicons/react/solid";
import { format } from "date-fns";
// import SyncStatus from "components/header/SyncStatus";
import Button from "ui/buttons/Button";
import cellSlice from "data/redux/slices/cellSlice";
import uiSlice from "data/redux/slices/uiSlice";
import DatePicker from "react-datepicker";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { CalendarContainer } from "react-datepicker";
import { CellContext } from "components/auth/CellProvider";
import { CogIcon, UsersIcon } from "@heroicons/react/outline";

const CalendarLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex min-h-screen flex-col">
      <CalendarHeader />

      <div className="date-picker relative grow overflow-x-auto">
        <div className="show-program-blocks absolute h-full w-full min-w-[1536px]">
          {children}
        </div>
      </div>
      <CreateLead />
    </main>
  );
};

export default CalendarLayout;

const CreateLead = () => {
  const cellContext = useContext(CellContext);
  const role = useRole();
  const t = useTranslation();
  if (role === "manager") {
    return (
      <Button
        className="w-fit-content absolute bottom-16 right-4 z-20 sm:bottom-4 sm:right-4"
        onClick={() => cellContext.toggleOpenCreateLead?.(true)}
        icon={<ViewGridAddIcon />}
        variant="contained"
      >
        {t("Create lead")}
      </Button>
    );
  } else return <></>;
};
const views = ["year", "month", "week"];

const viewOptions: MultiSwitchOption<string>[] = views.map((view) => ({
  label: `${view.charAt(0).toUpperCase()}${view.slice(1)}`,
  value: `/${view}`,
}));

function CalendarHeader() {
  const t = useTranslation();
  const router = useRouter();
  const role = useRole();
  const weekBounds = useWeekBounds();
  const dispatch = useAppDispatch();
  const query = useWeekSyncQuery(weekBounds.startTime);
  const { data, refetch: refetchLeads } = useLeadsQuery();

  const [openedModal, setOpenedModal] = useState(false);
  const cellContext = useContext(CellContext);

  useEffect(() => {
    if (query.data?.synced_at) {
      refetchLeads();
    }
  }, [refetchLeads, query.data?.synced_at]);

  const slim = cellContext.slim;
  useEffect(() => {
    document.body.addEventListener("click", (e: any) => {
      router.query.cellId && setOpenedModal(false);
      if (
        (e.target && e.target.closest(".date-picker__button")) ||
        (!e.target.closest(".react-datepicker__day") &&
          e.target.closest(".react-datepicker"))
      ) {
        setOpenedModal(true);
      } else {
        setOpenedModal(false);
      }
    });
    document.body.addEventListener("click", (e: any) => {
      if (e.target && e.target.closest(".create-cell")) {
        setOpenedModal(false);
      }
    });
    return () => {
      document.body.removeEventListener("click", (e: any) => {
        router.query.cellId && setOpenedModal(false);
        if (
          (e.target && e.target.closest(".date-picker__button")) ||
          (!e.target.closest(".react-datepicker__day") &&
            e.target.closest(".react-datepicker"))
        ) {
          setOpenedModal(true);
        } else {
          setOpenedModal(false);
        }
      });
      document.body.removeEventListener("click", (e: any) => {
        if (e.target && e.target.closest(".create-cell")) {
          setOpenedModal(false);
        }
      });
      document.body.removeEventListener("click", (e: any) => {
        if (e.target && e.target.closest(".create-cell")) {
          setOpenedModal(false);
        }
      });
    };
  }, []);
  useEffect(() => {
    cellContext.setUpdated?.(false);
  }, [data]);
  useEffect(() => {
    router.query.cellId && setOpenedModal(false);
    document.body.addEventListener("click", (e: any) => {
      if (e.target && e.target.closest(".cell-panel")) {
        setOpenedModal(false);
      }
    });
    return () =>
      document.body.removeEventListener("click", (e: any) => {
        if (e.target && e.target.closest(".cell-panel")) {
          setOpenedModal(false);
        }
      });
  }, [router.query.cellId]);

  return (
    <div className="relative shrink basis-[55px] overflow-x-auto overflow-y-hidden">
      <div
        className={classNames(
          "absolute flex min-h-0 w-full flex-1 flex-row items-center gap-2 overflow-auto whitespace-nowrap border-b border-gray-200 bg-white p-2 ",
          {
            "overflow-hidden": openedModal,
          }
        )}
      >
        <div className="flex grow items-center">
          <button
            className="flex h-8 w-8 items-center justify-center text-gray-800
          hover:rounded-full hover:bg-gray-500/10"
            onClick={() => {
              cellContext?.setUpdated?.(true);
              weekBounds.goToPreviousWeek();
            }}
          >
            <ChevronLeftIcon />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center text-gray-800
          hover:rounded-full hover:bg-gray-500/10"
            onClick={() => {
              cellContext?.setUpdated?.(true);
              weekBounds.goToNextWeek();
            }}
          >
            <ChevronRightIcon />
          </button>
          <div
            onClick={(e) => setOpenedModal(true)}
            className="date-picker__button relative ml-2 cursor-pointer font-semibold hover:text-indigo-400"
          >
            {format(weekBounds.startTime, "MMMM yyyy")}
          </div>

          {openedModal && (
            <PortalDatePicker>
              <div className="date-picker__portal">
                <DatePicker
                  open={openedModal}
                  calendarContainer={(containerProps) => (
                    <Transition
                      show={true}
                      enter="transition ease-out duration-800"
                      enterFrom="opacity-0 -translate-y-4"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-600"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 -translate-y-4"
                    >
                      <CalendarContainer {...containerProps} />
                    </Transition>
                  )}
                  selected={new Date(weekBounds.startTime)}
                  onChange={(date) => {
                    router.replace({
                      query: {
                        ...router.query,
                        start: format(
                          date !== null ? date : new Date(),
                          "yyyy-MM-dd"
                        ),
                      },
                    });
                  }}
                />
              </div>
            </PortalDatePicker>
          )}
        </div>

        {/* <SyncStatus startTime={weekBounds.startTime} /> */}

        <CheckBox
          options={[
            { label: "Assigned", value: "Assigned" },
            { label: "Applied", value: "Applied" },
          ]}
          onClick={(v) => {
            v.includes("Applied")
              ? cellContext.toggleApply?.(true)
              : cellContext.toggleApply?.(false);
            v.includes("Assigned")
              ? cellContext.toggleAssing?.(true)
              : cellContext.toggleAssing?.(false);
          }}
          onChange={(v) => {
            cellContext.setUpdated?.(true);
          }}
        />
        <CheckBox
          options={[
            { label: "Open", value: "Open" },
            { label: "Successful", value: "Successful" },
          ]}
          onClick={(v) => {
            cellContext.toggleStatus?.(v);
          }}
          onChange={(v) => cellContext.setUpdated?.(true)}
        />
        <CheckBox
          options={[
            { label: "e.V.", value: "e.V." },
            { label: "GmbH", value: "GmbH" },
            { label: "Ausbildung", value: "Ausbildung" },
          ]}
          onClick={(v) => {
            cellContext.toggleFilter?.(v);
          }}
          onChange={(v) => cellContext.setUpdated?.(true)}
        />
        <MultiSwitch
          icon={<UsersIcon />}
          value={cellContext.staffBy}
          options={[
            { label: "Staff", value: "Staff" },
            { label: "No Staff", value: "No Staff" },
          ]}
          onClick={(v) => {
            cellContext.toggleStaff?.(v === undefined ? "Staff" : v);
          }}
        />
        <MultiSwitch
          icon={<CogIcon />}
          value={cellContext.sortBy}
          options={[
            { label: "e.V.", value: "e.V." },
            { label: "GmbH", value: "GmbH" },
          ]}
          onClick={(v) => {
            cellContext.toggleSort?.(v === undefined ? "e.V." : v);
          }}
        />
        <MultiSwitch
          icon={<AdjustmentsIcon />}
          value={slim}
          options={[
            { label: "Full", value: false },
            { label: "Slim", value: true },
          ]}
          onClick={(v) => cellContext.toggleSlim?.(v)}
        />

        <MultiSwitch
          icon={<CalendarIcon />}
          value={router.pathname}
          options={viewOptions}
          onClick={(view) =>
            router.push({
              pathname: view,
              query: router.query,
            })
          }
        />
      </div>
    </div>
  );
}

export const PortalDatePicker = ({ children }: { children: ReactNode }) => {
  return ReactDOM.createPortal(
    <div
      className={classNames("modal date-picker__body fixed top-0")}
      style={{ zIndex: "100", top: `0px`, left: `60px` }}
    >
      {children}
    </div>,
    document.querySelector(".date-picker") ||
      (document.querySelector("#__next") as HTMLElement)
  );
};
