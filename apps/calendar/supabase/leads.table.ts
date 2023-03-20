import { supabaseClient } from "supabase/client";
import { add, formatISO } from "date-fns";

export type LeadTrainer = {
  id: string;
  name: string;
  time: string | null;
  leader: boolean;
  rejected: boolean;
};

export interface Lead {
  difference?: string[];
  id: number;
  created_at: string | null;
  hq_labs_synced: boolean;

  arrival_at: string;
  departure: string | null;
  programPeriod: string | null;
  customer_name: string;
  contact_person: string | null;
  status: any;
  required_trainers_amount: number | null;

  location: string | null;
  location_ev: string | null;

  automobile: string | null;
  attention_peculiarity: string | null;
  hotel_bill: string | null;
  called_asp: string | null;

  event_title: string | null;
  event_title_gmbh: string | null;
  event_title_ev: string | null;

  tn: string | null;
  offload: string | null;
  expenditure: string | null;
  daily_rate: string | null;
  subsystem: string | null;

  program_block_names: string | null;
  required_language: string | null;
  // trainers: LeadTrainer[];
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

const table = "leads";

export const selectLeads = async (startTime: number, endTime: number) => {
  const start = formatISO(startTime, { representation: "date" });

  const end = formatISO(add(endTime, { days: 1 }), {
    representation: "date",
  });
  //   return supabaseClient.from<Lead>(table).select("*").gte("arrival_at", start).lt("arrival_at", end);
  return supabaseClient.from<Lead>(table).select("*").gte("departure", start).lt("arrival_at", end);
};

export const upsertLeads = async (leads: Lead[]) => {
  supabaseClient.from<Lead>(table).upsert(leads);
};
