import Role from "./Role";
import roles from "./roles";

const isRole = (value: unknown): value is Role => {
  return roles.includes(value as Role);
};

export default isRole;
