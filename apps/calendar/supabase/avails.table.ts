import { supabaseClient } from "supabase/client";
import { formatISO } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

export type Avail = {
  id: number;
  created_at: string;
  trainer_id: string;
  date: string;
  status: boolean;
};

const table = "avails";

export async function selectAvailsByInterval(
  trainerId: string,
  interval: Interval
) {
  const response = await supabaseClient
    .from<Avail>(table)
    .select("*")
    .eq("trainer_id", trainerId)
    .gte("date", formatISO(interval.start, { representation: "date" }))
    .lte("date", formatISO(interval.end, { representation: "date" }));

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function selectAvailsByDates(trainerId: string, dates: Date[]) {
  const response = await supabaseClient
    .from<Avail>(table)
    .select("*")
    .eq("trainer_id", trainerId)
    .in(
      "date",
      dates.map((date) => formatISO(date, { representation: "date" }))
    );

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export const selectAvail = (trainerId: string, date: number | Date) =>
  supabaseClient
    .from<Avail>(table)
    .select("*")
    .eq("trainer_id", trainerId)
    .eq("date", formatISO(date, { representation: "date" }));

export const upsertAvail = (values: Partial<Avail>) =>
  supabaseClient.from<Avail>(table).upsert(values).single();

export function useAvailsUpsertMutation() {
  return useMutation<Avail[], PostgrestError, Partial<Avail>[]>(
    async (avails) => {
      if (avails.length <= 0) {
        return [];
      }

      const { data, error } = await supabaseClient
        .from<Avail>(table)
        .upsert(avails);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  );
}
