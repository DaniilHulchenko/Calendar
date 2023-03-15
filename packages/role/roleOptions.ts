import { MultiSwitchOption } from "ui/MultiSwitch";
import Role from "./Role";
import roleLabels from "./roleLabels";
import roles from "./roles";

const roleOptions: MultiSwitchOption<Role>[] = roles.map((role) => ({
  value: role,
  label: roleLabels[role],
}));

export default roleOptions;
