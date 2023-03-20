import toast from "react-hot-toast";
import { Lead } from "../supabase/leads.table";

const upsertLead = async (lead: Partial<Lead>) => {
  const keys = Object.keys(lead);

  toast(
    `The app should update the lead '${lead.id}' with '${keys.length}' keys here.`,
    {
      icon: "👏",
    }
  );
};

export default upsertLead;
