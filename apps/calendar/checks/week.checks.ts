import { milliseconds } from "date-fns";

export const weekSynced = (needSyncTime: number, syncedTime: number) => {
  return needSyncTime - syncedTime <= milliseconds({ seconds: 10 });
};
