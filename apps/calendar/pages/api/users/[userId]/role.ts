import type { NextApiRequest, NextApiResponse } from "next";
import isRole from "role/isRole";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!url) {
  throw new Error("There is no Supabase URL environment variable.");
}

const key = process.env.SUPABASE_SERVICE_KEY;

if (!key) {
  throw new Error("There is no Supabase key environment variable.");
}

const supabase = createClient(url, key);

const handleRole = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    return res.setHeader("Allow", ["PUT"]).status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (typeof req.query.userId !== "string") {
    return res.status(400).json({ message: "Missing userId" });
  }

  const role = req.body.role;

  if (!isRole(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const { data, error } = await supabase.auth.api.updateUserById(req.query.userId, { app_metadata: { role } });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(200).json(data);
};

export default handleRole;
