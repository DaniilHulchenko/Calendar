import { fetchLeads } from "data/hq/leads.hq";
import { hqLeadToLead } from "data/hqSupabaseAdapters/lead.adapters";
import { upsertLeads } from "supabase/leads.table";
import { upsertWeekSync, WeekSync } from "supabase/week_syncs.table";
import { endOfWeek, formatISO, getTime, parseISO } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { weekSynced } from "checks/week.checks";

const appToken = process.env.HQ_APP_TOKEN;

if (!appToken) {
  throw new Error("HQ_APP_TOKEN is not set");
}

/**
 * Supabase function hook uses the endpoint as a handler.
 */
const weekHandler = async (
  request: NextApiRequest,
  response: NextApiResponse
) => {
  if (request.query.API_SECRET_KEY !== process.env.API_SECRET_KEY) {
    return response.status(401).send("Unauthorized");
  }

  const weekSync: WeekSync = request.body.record;

  if (!weekSync.need_sync_at) {
    response.status(400).send("No need to sync");
    return;
  }

  if (weekSync.synced_at) {
    const syncedAtTime = getTime(parseISO(weekSync.synced_at));
    const needSyncAtTime = getTime(parseISO(weekSync.need_sync_at));

    if (weekSynced(needSyncAtTime, syncedAtTime)) {
      response.status(400).send("Already synced");
      return;
    }
  }

  const startTime = getTime(parseISO(weekSync.start));
  const endTime = getTime(endOfWeek(startTime, { weekStartsOn: 1 }));

  const page = await fetchLeads(startTime, endTime, appToken);
  const leads = page.value.map(hqLeadToLead);

  await upsertLeads(leads);

  await upsertWeekSync({
    start: weekSync.start,
    synced_at: formatISO(Date.now()),
  });

  response.send({ message: `week '${weekSync.start}' synced` });
};

export default weekHandler;
