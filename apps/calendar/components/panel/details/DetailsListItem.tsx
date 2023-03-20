const DetailsListItem = ({
  label,
  value,
  className,
  skeleton,
}: {
  label: string | undefined;
  value: string | number | boolean | null | undefined;
  className?: string;
  skeleton?: boolean;
}) => {
  if (!label) {
    throw new Error(`There is no label for the '${value}' value`);
  }

  return (
    <div className={className}>
      <h3 className="label-default">
        {skeleton ? (
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        ) : (
          label
        )}
      </h3>

      <p className="text-sm font-medium leading-5 text-gray-900">
        {skeleton ? (
          <div className="mt-1 h-4 animate-pulse rounded bg-gray-200" />
        ) : (
          value || "-"
        )}
      </p>
    </div>
  );
};

export default DetailsListItem;
