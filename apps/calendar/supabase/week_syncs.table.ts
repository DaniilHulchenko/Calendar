import { RealtimeSubscription } from "@supabase/supabase-js";
import { supabaseClient } from "supabase/client";
import { formatISO, milliseconds } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

export type WeekSync = {
  start: string;
  created_at: string;
  synced_at: string | null;
  need_sync_at: string | null;
};

const table = "week_syncs";

function createWeekSyncKey(startTime: number) {
  return [table, startTime];
}

export function useWeekSyncQuery(startTime: number) {
  return useQuery(createWeekSyncKey(startTime), async () => {
    const response = await supabaseClient
      .from<WeekSync>(table)
      .select("*")
      .eq("start", formatISO(startTime));

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (response.data.length === 0) {
      return null;
    }

    return response.data[0];
  });
}

export function useWeekSyncSubscription(startTime: number) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<RealtimeSubscription>();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(
      () => setOnline(subscriptionRef.current?.socket.isConnected() ?? false),
      milliseconds({ seconds: 1 })
    );

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    subscriptionRef.current = supabaseClient
      .from<WeekSync>(
        `${table}:start=eq.${formatISO(startTime, { representation: "date" })}`
      )
      .on("*", (payload) => {
        if (payload.eventType !== "UPDATE") {
          return;
        }

        queryClient.setQueryData(createWeekSyncKey(startTime), payload.new);
      })
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [queryClient, startTime]);

  return useMemo(() => ({ online }), [online]);
}

export const upsertWeekSync = (values: Partial<WeekSync>) =>
  supabaseClient.from<WeekSync>(table).upsert(values).single();
