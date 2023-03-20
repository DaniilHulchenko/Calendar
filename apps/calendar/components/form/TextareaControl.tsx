import classNames from "classnames";
import { ForwardedRef, forwardRef, useId } from "react";

const TextareaControl = (
  {
    className,
    label,
    srLabel,
    skeleton,
    ...rest
  }: Omit<JSX.IntrinsicElements["textarea"], "id"> & {
    label: string;
    srLabel?: boolean;
    skeleton?: boolean;
  },
  ref: ForwardedRef<HTMLTextAreaElement>
) => {
  const id = useId();

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={classNames("label-default", srLabel && "sr-only")}
      >
        {skeleton ? (
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        ) : (
          label
        )}
      </label>

      {skeleton ? (
        <div className="mt-1 h-40 w-full animate-pulse rounded bg-gray-200" />
      ) : (
        <textarea
          {...rest}
          ref={ref}
          id={id}
          className="input-default mt-1 h-40 w-full resize-none"
          placeholder={srLabel ? label : undefined}
        />
      )}
    </div>
  );
};

export default forwardRef(TextareaControl);
