import { LeadFieldValues } from "./../../components/calendar/week/leadFormFields";

import { supabaseClient } from "supabase/client";
import { useWeekBounds } from "components/calendar/WeekBoundsProvider";
import { selectLeads } from "supabase/leads.table";
import { useMutation, useQuery } from "@tanstack/react-query";

export const supabaseLeadsByStartEnd = (start: number, end: number) => ["leads", start, end];
export const supabaseLeads = (id: number) => ["leads", id];
const useLeadsQuery = () => {
  const weekBounds = useWeekBounds();

  return useQuery(
    supabaseLeadsByStartEnd(weekBounds.startTime, weekBounds.endTime),
    async () => {
      const response = await selectLeads(weekBounds.startTime, weekBounds.endTime);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    { enabled: false },
  );
};
function supabaseLead(leadId: number) {
  return ["lead", leadId];
}
export const useLeadQuery = (leadId: number) => {
  return useQuery(supabaseLead(leadId), async () => {
    const response = await supabaseClient.from("leads").select("*").eq("id", leadId);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  });
};

export const leadsMutation = async (values: LeadFieldValues) => {
  const response = await supabaseClient
    .from("leads")
    .update({
      arrival_at: values.arrivalAt,
      programPeriod: values.programPeriod,
      departure: values.departure,
      attention_peculiarity: values.attentionPeculiarity,
      automobile: values.automobile,
      called_asp: values.calledAsp,
      contact_person: values.contactPerson,
      customer_name: values.customerName,
      daily_rate: values.dailyRate,
      event_title: values.eventTitle,
      event_title_ev: values.eventTitleEv,
      event_title_gmbh: values.eventTitleGmbH,
      expenditure: values.expenditure,
      hotel_bill: values.hotelBill,
      hq_labs_synced: values.hqLabsSynced,
      location: values.location,
      location_ev: values.locationEv,
      offload: values.offload,
      required_language: values.requiredLanguage,
      required_trainers_amount: values.requiredTrainersAmount,
      status: values.status,
      subsystem: values.subsystem,
      tn: values.tn,
    })
    .eq("id", values.id);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
};

export default useLeadsQuery;
