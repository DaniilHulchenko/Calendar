import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "supabase/client";
import { Lead } from "./leads.table";
import { format } from "date-fns";

export type LeadConflict = {
  id: number;
  trainer_id: string;
  leads_id: any[];
  date: string | Date;
  created_at: string;
  lead_id: number;
  isIgnore: boolean
};

const table = "lead_conflict";

export function createLeadConflictName() {
  return [table];
}
export async function checkExistedConflict(lead_id: number) {
  const checkExistedLeads = await supabaseClient.from<LeadConflict>(table).select("*").eq("lead_id", lead_id);

  return checkExistedLeads.data;
}

export const insertLeadsConflictMutation = () =>
  useMutation([table, "mutation"], async (values: { trainerId: string; leads: Lead[]; date: string | Date, isIgnore?:boolean }[]) => {
    values.forEach(async (item) => {
      const checkExistedLeads = await supabaseClient
        .from<LeadConflict>(table)
        .select("*")
        .eq("date", format(new Date(item.date), "yyyy-MM-dd"))
        .eq("trainer_id", item.trainerId);

      if (checkExistedLeads.data !== null && checkExistedLeads?.data?.length < item.leads.length) {
        await supabaseClient
          .from<LeadConflict>(table)
          .update({ leads_id: item.leads })
          .eq("date", format(new Date(item.date), "yyyy-MM-dd"))
          .eq("trainer_id", item.trainerId);
        console.clear();
      }

      if (checkExistedLeads.data !== null && checkExistedLeads.data.length > 0) {
        return null;
      } else {
        let filteredValues = {
          leads_id: item.leads,
          trainer_id: item.trainerId,
          date: format(new Date(item.date), "yyyy-MM-dd"),
          trainer_date: `${format(new Date(item.date), "yyyy-MM-dd")}${item.trainerId}`,
          isIgnore: item.isIgnore ? true:false,
        };
        if (filteredValues.leads_id.length > 1) {
          const response = await supabaseClient.from<LeadConflict>(table).insert(filteredValues);
          console.clear();
        }
        return null;
      }
    });
  });

export function useLeadsConflictQuery() {
  return useQuery(createLeadConflictName(), async () => {
    const response = await supabaseClient.from<LeadConflict>(table).select("*");

    if (response.error) {
      throw new Error(response.error.message);
    }
    response.data.forEach(async (lead) => {
      if (lead.leads_id.length === 1) {
        await supabaseClient.from<LeadConflict>(table).delete().eq("id", lead.id);
      }
    });

    return response.data;
  });
}

export async function terminateTrainerConflict(date: string | Date, leadId: number, trainerId: string) {
  const checkExistedLeads = await supabaseClient
    .from<LeadConflict>(table)
    .select("*")
    .eq("date", format(new Date(date), "yyyy-MM-dd"))
    .eq("trainer_id", trainerId);
  if (checkExistedLeads.data !== null) {
    let filteredLead = checkExistedLeads.data.map((existed) => {
      let filteredLead = existed.leads_id.filter((lead) => {
        lead = JSON.parse(lead);
        if (+lead.id !== +leadId) return lead;
      });
      return { ...existed, leads_id: filteredLead };
    });
    if (filteredLead) {
      await supabaseClient
        .from<LeadConflict>(table)
        .update({ leads_id: filteredLead[0]?.leads_id })
        .eq("date", format(new Date(date), "yyyy-MM-dd"))
        .eq("trainer_id", trainerId)
        .select("*");
    }
  }
}

export async function terminateTrainer(values: {
  leadId: string;
  trainerId: string;
  updatedLeads: string[];
  date: string | Date;
}) {
  if(values.leadId === 'ignore'){
    const termianteConflict = await supabaseClient
    .from<LeadConflict>(table)
    .update({ isIgnore: true})
    .eq("date", values.date)
    .eq("trainer_id", values.trainerId)
    .select("*");
  if (termianteConflict.error) {
    throw new Error(termianteConflict.error.message);
  }

  const response = await supabaseClient.from("trainer_lead").select("*");
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
  } else {
  const terminateTeam = await supabaseClient
    .from("trainer_lead")
    .delete()
    .eq("id_lead", values.leadId)
    .eq("id_profiles", values.trainerId);

  if (terminateTeam.error) {
    throw new Error(terminateTeam.error.message);
  }
  const termianteConflict = await supabaseClient
    .from<LeadConflict>(table)
    .update({ leads_id: values.updatedLeads })
    .eq("date", values.date)
    .eq("trainer_id", values.trainerId)
    .select("*");
  if (termianteConflict.error) {
    throw new Error(termianteConflict.error.message);
  }

  const response = await supabaseClient.from("trainer_lead").select("*");
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
}
}
