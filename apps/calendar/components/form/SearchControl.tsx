import { SearchIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import _ from "lodash";
import { ForwardedRef, forwardRef, useEffect, useId, useMemo } from "react";

type SearchControlProps = Omit<JSX.IntrinsicElements["input"], "id"> & {
  label: string;
};

const SearchControl = (
  { className, label, type = "text", onChange, ...props }: SearchControlProps,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const id = useId();

  const handleChange = useMemo(
    () => onChange && _.debounce(onChange, 300),
    [onChange]
  );

  useEffect(() => {
    return () => {
      handleChange?.cancel();
    };
  }, [handleChange]);

  return (
    <div className={classNames("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <div className="absolute inset-y-0 left-0 flex w-[38px] items-center justify-center">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>

      <input
        {...props}
        ref={ref}
        id={id}
        type={type}
        className="input-default w-full pl-[38px]"
        onChange={handleChange}
      />
    </div>
  );
};

export default forwardRef(SearchControl);
