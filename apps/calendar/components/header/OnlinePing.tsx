import classNames from "classnames";

const OnlinePing = ({ className, online }: { className?: string; online: boolean }) => (
  <span className={classNames("flex", className)}>
    <span
      className={classNames(
        "absolute h-full w-full animate-ping rounded-full opacity-75",
        online ? "bg-green-400" : "bg-red-400",
      )}
    />
    <span className={classNames("relative h-3 w-3 rounded-full", online ? "bg-green-500" : "bg-red-500")} />
  </span>
);

export default OnlinePing;
