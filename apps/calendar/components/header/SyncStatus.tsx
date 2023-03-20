import OnlinePing from "./OnlinePing";
import { format, formatISO, getTime, parseISO } from "date-fns";
import { useEffect } from "react";
import { weekSynced } from "checks/week.checks";
import { useMutation } from "@tanstack/react-query";
import {
  upsertWeekSync,
  useWeekSyncQuery,
  useWeekSyncSubscription,
  WeekSync,
} from "supabase/week_syncs.table";

const SyncStatus = ({ startTime }: { startTime: number }) => {
  const subscription = useWeekSyncSubscription(startTime);
  const query = useWeekSyncQuery(startTime);

  const { mutate } = useMutation(async (values: Partial<WeekSync>) => {
    const response = await upsertWeekSync(values);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  });

  useEffect(() => {
    if (query.isLoading) {
      return;
    }

    if (
      query.data?.synced_at &&
      weekSynced(Date.now(), getTime(parseISO(query.data.synced_at)))
    ) {
      return;
    }

    mutate({
      start: formatISO(startTime),
      need_sync_at: formatISO(Date.now()),
    });
  }, [mutate, startTime, query.data?.synced_at, query.isLoading]);

  return (
    <div className="relative mr-2">
      <div className="label-default pr-4">Last synced</div>

      <div className="text-sm font-medium leading-5 text-gray-900">
        {query.isLoading && (
          <div className="mt-1 h-4 w-20 animate-pulse rounded bg-gray-200" />
        )}

        {query.data?.synced_at &&
          format(parseISO(query.data.synced_at), "MMM d H:mm")}

        {!query.isLoading && !query.data?.synced_at && "Never"}
      </div>

      <OnlinePing
        className="absolute top-0 right-0 -mt-1 -mr-1"
        online={subscription.online}
      />
    </div>
  );
};

export default SyncStatus;
