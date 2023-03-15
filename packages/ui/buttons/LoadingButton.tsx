import classNames from "classnames";
import { ComponentProps } from "react";
import Button from "ui/buttons/Button";

const LoadingButton = ({
  loading,
  className,
  ...buttonProps
}: ComponentProps<typeof Button> & {
  loading: boolean;
}) => {
  return (
    <Button
      {...buttonProps}
      className={classNames(className, loading && "animate-pulse")}
      disabled={loading}
    />
  );
};

export default LoadingButton;
