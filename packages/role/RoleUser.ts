import { User } from "@supabase/supabase-js";
import Role from "./Role";

type RoleUser = User & {
  app_metadata: {
    role?: Role;
  };
};

export default RoleUser;
