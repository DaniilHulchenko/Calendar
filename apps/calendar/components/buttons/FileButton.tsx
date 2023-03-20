import { ChangeEventHandler, ComponentProps } from "react";
import Button from "ui/buttons/Button";

function FileButton({
  accept,
  onChange,
  ...buttonProps
}: Omit<ComponentProps<typeof Button>, "component" | "onChange"> & {
  accept?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="block">
      <input type="file" accept={accept} hidden onChange={onChange} />
      <Button {...buttonProps} component="span" />
    </label>
  );
}

export default FileButton;
