import { Field } from "formik";
import { toast } from "react-hot-toast";
import upsertLead from "data/updateEventById";
import { useAppDispatch, useAppSelector } from "data/redux/store";
import cellSlice from "data/redux/slices/cellSlice";
import { useCallback, useContext, useMemo } from "react";
import * as yup from "yup";
import {
  LeadFieldValues,
  fieldValuesToLead,
  leadFieldLabels,
  leadToFieldValues,
  yupLeadFormSchema,
} from "./leadFormFields";
import {
  DatePickerField,
  PanelForm,
  SelectField,
  TextField,
} from "components/formik";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  leadsMutation,
  supabaseLeads,
  supabaseLeadsByStartEnd,
} from "loading/queries/useLeadsQuery";
import { useTranslation } from "components/translation";
import { useWeekBounds } from "../WeekBoundsProvider";
import { Lead, Mutable } from "supabase/leads.table";
import { CellContext } from "components/auth/CellProvider";
import { sendEmail } from "config/email";
import { useLeadTeam, useLeadTeamWithEmail } from "supabase/trainer_lead.table";
import { format } from "date-fns";

const LeadForm = ({ lead }: { lead: Partial<Lead> }) => {
  const dispatch = useAppDispatch();
  const cell = useAppSelector((state) => state.cell);
  const QueryClient = useQueryClient();
  const t = useTranslation();
  const weekBounds = useWeekBounds();
  const cellContext = useContext(CellContext);
  const team = useLeadTeamWithEmail(lead.id || 0);
  const initialValues = useMemo(
    () => leadToFieldValues(cell.draft),
    [cell.draft]
  );
  const sendEmailHTML = (leadName: string, date: string) => {
    return `<div><p>The lead ${leadName}(${date})  has been updated</p></div>`;
  };
  const updateLeadMutation = useMutation({
    mutationFn: leadsMutation,
    onSuccess: (updatedLead) => {
      QueryClient.setQueryData<LeadFieldValues[]>(
        supabaseLeadsByStartEnd(weekBounds.startTime, weekBounds.endTime),
        (oldLeadInfo = []) =>
          oldLeadInfo.map((lead) =>
            lead.id === updatedLead[0].id ? updatedLead[0] : lead
          )
      );

      toast.success(t("Lead updated"));
      cellContext.toggleUpdate?.();
      dispatch(cellSlice.actions.clearDraft());
      team.data?.map((team) => {
        sendEmail(
          team.users.email,
          sendEmailHTML(
            lead.event_title
              ? `${lead.event_title} - ${lead.customer_name}`
              : lead.customer_name || "",
            `${format(
              new Date(lead.arrival_at || ""),
              "dd-MM-yyyy"
            )} - ${format(
              new Date(lead.departure || lead.arrival_at || ""),
              "dd-MM-yyyy"
            )}`
          ),
          `The lead has been updated`
        );
      });
    },
  });

  /** @todo Handle loading. */
  const handleSubmit = async (values: LeadFieldValues) => {
    cellContext.toggleUpdate?.();
    updateLeadMutation.mutateAsync(values);
  };

  const handleCancelClick = () => {
    if (cell.id === "new_cell") {
      dispatch(cellSlice.actions.dismissLead());
    }
    dispatch(cellSlice.actions.clearDraft());
  };

  const handleNewValues = useCallback(
    (values: LeadFieldValues) =>
      dispatch(cellSlice.actions.updateDraft(fieldValuesToLead(values))),
    [dispatch]
  );

  return (
    <PanelForm
      initialValues={initialValues}
      validationSchema={yupLeadFormSchema}
      onSubmit={handleSubmit}
      onCancel={handleCancelClick}
      onNewValues={handleNewValues}
    >
      <label className="group flex cursor-pointer items-center gap-2 rounded py-1 text-sm font-semibold uppercase transition hover:bg-white/50 active:bg-white">
        <Field
          name="hqLabsSynced"
          className="h-5 w-5 rounded border border-gray-200 bg-gray-50 text-indigo-500 focus:ring-indigo-400 focus:ring-opacity-25"
          type="checkbox"
        />
        {leadFieldLabels.hqLabsSynced}
      </label>

      <TextField
        name="customerName"
        label={leadFieldLabels.customerName}
        type="text"
      />
      <TextField
        name="programPeriod"
        label={leadFieldLabels.programPeriod}
        type="text"
      />
      <DatePickerField name="arrivalAt" label={leadFieldLabels.arrivalAt} />
      <DatePickerField
        name="departure"
        label={leadFieldLabels.departure}
        minDate={lead.arrival_at}
      />
      <TextField
        name="automobile"
        label={leadFieldLabels.automobile}
        type="text"
      />
      <TextField name="location" label={leadFieldLabels.location} type="text" />

      <TextField
        name="requiredTrainersAmount"
        label="Required Number of Trainers"
        type="number"
      />

      <TextField
        name="eventTitle"
        label={leadFieldLabels.eventTitle}
        type="text"
      />
      <TextField name="tn" label={leadFieldLabels.tn} type="text" />

      <TextField
        name="contactPerson"
        label={leadFieldLabels.contactPerson}
        type="text"
      />

      <TextField name="offload" label={leadFieldLabels.offload} type="text" />
      <TextField
        name="calledAsp"
        label={leadFieldLabels.calledAsp}
        type="text"
      />
      <TextField
        name="expenditure"
        label={leadFieldLabels.expenditure}
        type="text"
      />
      <TextField
        name="hotelBill"
        label={leadFieldLabels.hotelBill}
        type="text"
      />

      <TextField
        name="attentionPeculiarity"
        label={leadFieldLabels.attentionPeculiarity}
        type="text"
      />
      <TextField name="cache" label={leadFieldLabels.cache} type="text" />

      <TextField
        name="dailyRate"
        label={leadFieldLabels.dailyRate}
        type="text"
      />
      <SelectField
        name="requiredLanguage"
        label={leadFieldLabels.requiredLanguage}
        type="select"
      />
    </PanelForm>
  );
};

export default LeadForm;
