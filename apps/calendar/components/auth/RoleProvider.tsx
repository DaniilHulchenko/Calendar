import { createContext, ReactNode, useContext } from "react";
import { useSupabaseUser } from "./SupabaseUserProvider";
import Role from "role/Role";

const RoleContext = createContext<Role | undefined>(undefined);

const RoleProvider = ({ children }: { children: ReactNode }) => {
  const user = useSupabaseUser();

  return (
    <RoleContext.Provider value={user.app_metadata.role || "trainer"}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleProvider;

export const useRole = () => {
  const role = useContext(RoleContext);

  if (role === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }

  return role;
};
