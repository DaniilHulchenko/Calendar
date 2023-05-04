import { createContext, Fragment, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseAuth } from "./SupabaseAuthProvider";
import RoleProvider, { useRole } from "./RoleProvider";
import RoleUser from "role/RoleUser";
import { motion, Variants } from "framer-motion";
import { useTranslation } from "components/translation";
import SolidCalendarIcon from "@heroicons/react/solid/CalendarIcon";
import SolidPushPinIcon from "components/icons/solid/PushPinIcon";
import OutlineCalendarIcon from "@heroicons/react/outline/CalendarIcon";
import OutlinedPushPinIcon from "components/icons/outline/PushPinIcon";
import { UserIcon, PuzzleIcon, UsersIcon, SaveIcon, XIcon, BanIcon } from "@heroicons/react/outline";
import roleLabels from "role/roleLabels";
import SidebarLink from "components/layout/SidebarLink";
import CellProvider, { CellContext } from "./CellProvider";
import classNames from "classnames";
import { Panel } from "components/layout";
import { Tab } from "@headlessui/react";
import CloseButton from "ui/buttons/CloseButton";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import WeekBoundsProvider, { useWeekBounds } from "components/calendar/WeekBoundsProvider";
import {
  LeadFieldValues,
  yupLeadFormSchema,
  leadFieldLabels,
  yupRedLeadFormSchema,
} from "components/calendar/week/leadFormFields";
import {
  TextField,
  DatePickerField,
  SelectField,
  SubmitButton,
  SelectFieldStatus,
  SelectFieldSubSystem,
} from "components/formik";
import { Formik } from "formik";
import { leadsInsert, leadsInsertRed, supabaseLeadsByStartEnd } from "loading/queries/useLeadsQuery";
import toast from "react-hot-toast";
import DefaultDialogButtons from "ui/dialog/DefaultDialogButtons";
import Button from "ui/buttons/Button";
import { useLeadsConflictQuery } from "supabase/lead_conflict";
import { useRefactorConflict } from "hooks/useRefactorConflicts";

const SupabaseUserContext = createContext<RoleUser | undefined>(undefined);

const SupabaseUserProvider = ({ requireAuth, children }: { requireAuth: boolean | undefined; children: ReactNode }) => {
  const router = useRouter();
  const auth = useSupabaseAuth();

  useEffect(() => {
    /** @todo use rendering instead of redirect */
    if (requireAuth && auth.session === null) {
      router.push("/login");
    }
  }, [auth.session, requireAuth, router]);

  if (!requireAuth) {
    return <Fragment>{children}</Fragment>;
  }

  if (!auth.session || !auth.session.user) {
    return null;
  }

  return (
    <SupabaseUserContext.Provider value={auth.session.user}>
      <RoleProvider>
        <CellProvider>
          <WeekBoundsProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </WeekBoundsProvider>
        </CellProvider>
      </RoleProvider>
    </SupabaseUserContext.Provider>
  );
};

export default SupabaseUserProvider;

export const useSupabaseUser = () => {
  const user = useContext(SupabaseUserContext);

  if (user === undefined) {
    throw new Error("useSupabaseUser must be used within a SupabaseUserProvider");
  }

  return user;
};

const storageKey = "sidebar_pinned";

function SidebarLayout({ children }: { children: ReactNode }) {
  const t = useTranslation();
  const role = useRole();
  const cellContext = useContext(CellContext);

  return (
    <div className=" flex h-screen overflow-hidden sm:mb-0">
      {open !== undefined && (
        <motion.nav
          className={classNames(
            "absolute bottom-0 z-30 max-h-screen w-full shrink-0 overflow-hidden border-r border-indigo-800 bg-indigo-900 shadow-2xl sm:static sm:mt-0 sm:w-[80px] lg:w-[240px]",
          )}
          whileHover={"opened"}
        >
          <div className="flex h-full w-auto items-center justify-center sm:flex-col sm:items-start lg:w-60">
            <div className="flex items-center gap-1 py-2 px-3 sm:py-7 lg:px-5">
              <div className="flex grow flex-wrap items-center justify-center gap-3 lg:flex-nowrap">
                <motion.div
                  className="flex hidden items-center justify-center rounded-xl bg-indigo-500 p-2 sm:block"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "just" }}
                >
                  <SolidCalendarIcon className="h-7 w-7 text-white" />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "just" }}
                >
                  <h1 className="text-md hidden font-bold text-white lg:block lg:text-lg">{t("Shift plan")}</h1>

                  <div className=" ml-2 hidden text-sm font-bold text-white sm:ml-0 sm:block sm:px-0 sm:font-semibold sm:text-indigo-300 lg:m-0">
                    {roleLabels[role]}
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              className="max-w-sm py-2 sm:w-full sm:grow sm:py-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "just" }}
            >
              <SidebarLink href="/week" icon={<OutlineCalendarIcon />} text={t("Calendar")} />
            </motion.div>

            <AdminNavigation />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "just" }}
              className="max-w-sm py-2 sm:w-full sm:py-6"
            >
              <SidebarLink href="/profile" icon={<UserIcon />} text={t("Profile")} />
            </motion.div>
          </div>
        </motion.nav>
      )}

      <div className="grow">{children}</div>
      {cellContext.openCreateLead && <CreateCellPanel />}
    </div>
  );
}

function AdminNavigation() {
  const t = useTranslation();
  const [conflict, setConflict] = useState(0);
  const role = useRole();
  const { data } = useLeadsConflictQuery();
  const conflictedTrainers = useMemo(() => data?.filter((conflict) => !conflict.isIgnore), [data]);

  useEffect(() => {
    setConflict(conflictedTrainers?.length || 0);
  }, [data]);
  return (
    <motion.div
      className="flex py-2 sm:block sm:w-full sm:py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "just" }}
    >
      <Fragment>
        {role === "manager" && (
          <div className="relative">
            <SidebarLink href="/conflicts" icon={<BanIcon />} text={t("HR Conflicts")} />
            {!!conflict && (
              <span className="absolute left-[-5px] top-[-5px] ml-2 inline-block whitespace-nowrap rounded-[0.27rem] bg-red-200 px-[0.65em] pt-[0.35em] pb-[0.25em] text-center align-baseline text-[0.75em] font-bold leading-none text-red-700 sm:top-0 sm:left-0">
                {conflict > 99 ? "99.." : `${conflict}`}
              </span>
            )}
          </div>
        )}
        <SidebarLink href="/trainers" icon={<UsersIcon />} text={t("Trainers")} />

        <SidebarLink href="/program-blocks" icon={<PuzzleIcon />} text={t("Program blocks")} />
      </Fragment>
    </motion.div>
  );
}
function CreateCellPanel() {
  const t = useTranslation();
  const role = useRole();
  const cellContext = useContext(CellContext);
  const router = useRouter();

  const [defaultIndex, setDefaultIndex] = useState(0);

  const handleClose = async () => {
    cellContext.toggleOpenCreateLead?.(false);
  };

  const lead = "Lead";
  const specialFeature = t("Special Feature");

  return (
    <>
      <Panel className=" mx-10px absolute top-[50px] left-0 z-50 flex max-h-[calc(100vh_-_100px)] w-screen max-w-lg flex-col sm:left-[20%] sm:mx-0">
        <div className="overflow-auto">
          <Tab.Group onChange={(i) => setDefaultIndex(i)} defaultIndex={defaultIndex}>
            <div className="sticky top-0 z-20 border-b bg-white px-6 pt-6">
              <div className="flex gap-6">
                <div className="grow">
                  <div className="font-bold">{t("Create lead")}</div>
                </div>

                <CloseButton onClick={handleClose} />
              </div>

              <Tab.List className="flex space-x-4 pt-2">
                {[lead, specialFeature].map((tabName) => (
                  <Tab
                    key={tabName}
                    className={({ selected }) =>
                      classNames(
                        "-mb-[1px] border-b-2 pb-2 text-sm font-medium uppercase leading-5 transition focus:outline-none",
                        selected && "cursor-default border-indigo-500 text-indigo-500",
                        !selected && "border-transparent text-gray-500 hover:text-indigo-500",
                      )
                    }
                  >
                    {tabName}
                  </Tab>
                ))}
              </Tab.List>
            </div>

            <Tab.Panels as={Fragment}>
              {defaultIndex === 0 && <CreateLeadPanel />}
              {defaultIndex === 1 && <CreateRedLeadPanel />}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </Panel>
      <div onClick={handleClose} className="absolute z-40 h-[100vh] w-[100vw] bg-black opacity-40"></div>
    </>
  );
}

function CreateLeadPanel() {
  const QueryClient = useQueryClient();
  const weekBounds = useWeekBounds();
  const cellContext = useContext(CellContext);
  const insertLeadMutation = useMutation({
    mutationFn: leadsInsert,
    onSuccess: (updatedLead) => {
      QueryClient.setQueryData<LeadFieldValues[]>(
        supabaseLeadsByStartEnd(weekBounds.startTime, weekBounds.endTime),
        (oldLeadInfo = []) => [...oldLeadInfo, updatedLead[0]],
      );
      toast.success(t("Lead created"));
      cellContext.toggleUpdate?.();
    },
    onError: () => {
      cellContext.toggleUpdate?.();
      toast.error(t("Something went wrong"));
    },
  });

  const handleCancelClick = () => {
    cellContext.toggleOpenCreateLead?.(false);
  };

  const t = useTranslation();
  const initialValue = {
    customerName: "",
    programPeriod: "",
    arrivalAt: "",
    departure: "",
    automobile: "",
    location: "",
    requiredTrainersAmount: 0,
    eventTitle: "",
    tn: "",
    status: "",
    subsystem: "",
    contactPerson: "",
    offload: "",
    calledAsp: "",
    expenditure: "",
    hotelBill: "",
    attentionPeculiarity: "",
    cache: "",
    dailyRate: "",
    requiredLanguage: "",
  };

  return (
    <Fragment>
      <Formik
        initialValues={initialValue}
        validationSchema={yupLeadFormSchema}
        onSubmit={(values, { setSubmitting }) => {
          cellContext.toggleUpdate?.();
          insertLeadMutation.mutateAsync(values);
        }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="create-cell relative">
            <div className="p-5">
              <TextField name="customerName" label={leadFieldLabels.customerName} type="text" />
              <TextField name="programPeriod" label={leadFieldLabels.programPeriod} type="text" />
              <DatePickerField name="arrivalAt" label={leadFieldLabels.arrivalAt} />
              <DatePickerField name="departure" label={leadFieldLabels.departure} />
              <TextField name="automobile" label={leadFieldLabels.automobile} type="text" />
              <TextField name="location" label={leadFieldLabels.location} type="text" />

              <TextField name="requiredTrainersAmount" label="Required Number of Trainers" type="number" />

              <TextField name="eventTitle" label={leadFieldLabels.eventTitle} type="text" />
              <TextField name="tn" label={leadFieldLabels.tn} type="text" />

              <TextField name="contactPerson" label={leadFieldLabels.contactPerson} type="text" />

              <TextField name="offload" label={leadFieldLabels.offload} type="text" />
              <TextField name="calledAsp" label={leadFieldLabels.calledAsp} type="text" />
              <TextField name="expenditure" label={leadFieldLabels.expenditure} type="text" />
              <TextField name="hotelBill" label={leadFieldLabels.hotelBill} type="text" />

              <TextField name="attentionPeculiarity" label={leadFieldLabels.attentionPeculiarity} type="text" />
              <TextField name="cache" label={leadFieldLabels.cache} type="text" />

              <TextField name="dailyRate" label={leadFieldLabels.dailyRate} type="text" />
              <SelectField name="requiredLanguage" label={leadFieldLabels.requiredLanguage} type="select" />
              <SelectFieldStatus name="status" label={leadFieldLabels.status} type="select" />
              <SelectFieldSubSystem name="subsystem" label={leadFieldLabels.subsystem} type="select" />
            </div>
            <DefaultDialogButtons className="sticky bottom-0 flex w-full items-center gap-3">
              <SubmitButton type="submit" icon={<SaveIcon />}>
                {t("Save")}
              </SubmitButton>

              <Button type="button" icon={<XIcon />} variant="outlined" onClick={handleCancelClick}>
                {t("Abort")}
              </Button>
            </DefaultDialogButtons>
          </form>
        )}
      </Formik>
    </Fragment>
  );
}

function CreateRedLeadPanel() {
  const QueryClient = useQueryClient();
  const weekBounds = useWeekBounds();
  const cellContext = useContext(CellContext);
  const [specialFeatureText, setSpecialfeatureText] = useState("");
  const insertLeadMutation = useMutation({
    mutationFn: leadsInsertRed,
    onSuccess: (updatedLead: any[]) => {
      QueryClient.setQueryData<LeadFieldValues[]>(
        supabaseLeadsByStartEnd(weekBounds.startTime, weekBounds.endTime),
        (oldLeadInfo = []) => [...oldLeadInfo, updatedLead[0]],
      );
      toast.success(t("Lead created"));
      cellContext.toggleUpdate?.();
    },
    onError: () => {
      cellContext.toggleUpdate?.();
      toast.error(t("Something went wrong"));
    },
  });

  const handleCancelClick = () => {
    cellContext.toggleOpenCreateLead?.(false);
  };

  const t = useTranslation();
  const initialValue = {
    customerName: "",
    arrivalAt: "",
    departure: "",
    specialFeature: "",
  };

  return (
    <Fragment>
      <Formik
        initialValues={initialValue}
        validationSchema={yupRedLeadFormSchema}
        onSubmit={(values, { setSubmitting }) => {
          const newValues = { ...values, specialFeature: specialFeatureText };
          cellContext.toggleUpdate?.();
          insertLeadMutation.mutateAsync(newValues);
        }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="create-cell relative">
            <div className=" p-5">
              <TextField name="customerName" label={leadFieldLabels.customerName} type="text" />
              <DatePickerField name="arrivalAt" label={leadFieldLabels.arrivalAt} />
              <DatePickerField name="departure" label={leadFieldLabels.departure} />
              <div>
                <label htmlFor={"specialFeature"} className="label-default">
                  {"Besonderheit / Zusatzinfo"}
                </label>
                <textarea
                  value={specialFeatureText}
                  style={{ resize: "none" }}
                  className="input-default mt-1 h-[150px] w-full"
                  name="specialFeature"
                  onChange={(e) => setSpecialfeatureText(e.target.value)}
                />
              </div>
            </div>
            <DefaultDialogButtons className="sticky bottom-0 flex w-full items-center gap-3">
              <SubmitButton type="submit" icon={<SaveIcon />}>
                {t("Save")}
              </SubmitButton>

              <Button type="button" icon={<XIcon />} variant="outlined" onClick={handleCancelClick}>
                {t("Abort")}
              </Button>
            </DefaultDialogButtons>
          </form>
        )}
      </Formik>
    </Fragment>
  );
}
