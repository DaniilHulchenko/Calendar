import { LeadFieldValues } from "./../../components/calendar/week/leadFormFields";

import { supabaseClient } from "supabase/client";
import { useWeekBounds } from "components/calendar/WeekBoundsProvider";
import { Lead, selectLeads } from "supabase/leads.table";
import { useMutation, useQuery } from "@tanstack/react-query";

export const supabaseLeadsByStartEnd = (start: number, end: number) => ["leads", start, end];
export const supabaseLeads = (id: number) => ["leads", id];
const useLeadsQuery = () => {
  const weekBounds = useWeekBounds();
  return useQuery(supabaseLeadsByStartEnd(weekBounds.startTime, weekBounds.endTime), async () => {
    //weekBounds.startTime, weekBounds.endTime
    // const response = await selectLeads();
    const response = await supabaseClient.from<Lead>("leads").select("*");

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  });
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
      cache: values.cache,
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
interface ILeadsInsert {
  arrivalAt: string | null;
  attentionPeculiarity: string | null;
  cache: string | number | null;
  automobile: string | null;
  calledAsp: string | null;
  contactPerson: string | null;
  customerName: string | null;
  dailyRate: string | null;
  departure: string | null;
  eventTitle: string | null;
  expenditure: string | null;
  hotelBill: string | null;
  location: string | null;
  offload: string | null;
  programPeriod: string | null;
  requiredLanguage: string | null;
  requiredTrainersAmount: number | null;
  status: string | null;
  subsystem: string | null;
  tn: string | null;
}
export const leadsInsert = async (values: ILeadsInsert) => {
  const response = await supabaseClient
    .from("leads")
    .upsert({
      arrival_at: values.arrivalAt,
      programPeriod: values.programPeriod,
      departure: values.departure,
      attention_peculiarity: values.attentionPeculiarity,
      cache: values.cache,
      hq_labs_synced: false,
      automobile: values.automobile,
      called_asp: values.calledAsp,
      contact_person: values.contactPerson,
      customer_name: values.customerName,
      daily_rate: values.dailyRate,
      event_title: values.eventTitle,
      expenditure: values.expenditure,
      hotel_bill: values.hotelBill,
      location: values.location,
      offload: values.offload,
      required_language: values.requiredLanguage,
      required_trainers_amount: values.requiredTrainersAmount,
      status: values.status,
      subsystem: values.subsystem,
      tn: values.tn,
    })
    .single();

  if (response.error) {
    throw new Error(response.error.message);
  }
  return [response.data];
};

export const leadsInsertRed = async (values: {
  customerName: string;
  arrivalAt: string | null;
  departure: string | null;
  specialFeature: string | null;
}) => {
  const response = await supabaseClient
    .from("leads")
    .upsert({
      programPeriod: null,
      attention_peculiarity: null,
      automobile: null,
      called_asp: null,
      contact_person: null,
      customer_name: values.customerName,
      daily_rate: null,
      event_title: null,
      expenditure: null,
      hotel_bill: null,
      location: null,
      offload: null,
      required_language: null,
      required_trainers_amount: null,
      status: "Unsuccessful",
      subsystem: null,
      tn: null,
      arrival_at: values.arrivalAt,
      departure: values.departure,
      hq_labs_synced: false,
      special: true,
      specialFeature: values.specialFeature,
    })
    .single();

  if (response.error) {
    throw new Error(response.error.message);
  }
  return [response.data];
};

export default useLeadsQuery;
