import { ForwardedRef, forwardRef, useId } from "react";

type InputControlProps = Omit<JSX.IntrinsicElements["input"], "id"> & {
  label: string;
  skeleton?: boolean;
};

const InputControl = (
  props: InputControlProps,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const { className, label, skeleton, ...rest } = props;
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className="label-default">
        {skeleton ? (
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        ) : (
          label
        )}
      </label>

      {skeleton ? (
        <div className="mt-1 h-9 animate-pulse rounded bg-gray-200" />
      ) : (
        <input
          {...rest}
          ref={ref}
          id={id}
          className="input-default mt-1 w-full"
        />
      )}
    </div>
  );
};

export default forwardRef(InputControl);
