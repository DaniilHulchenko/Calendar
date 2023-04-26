const merge = (...values: (string | null | undefined)[]) =>
  values.filter((value) => value).join("; ");

export default merge;
