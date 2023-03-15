import { ReactNode } from "react";

const ListLayout = ({
  tools,
  items,
  responsive,
  children,
}: {
  tools?: ReactNode;
  items: ReactNode;
  responsive?: boolean;
  children: ReactNode;
}) => (
  <div className="flex h-full flex-col">
    {tools && <div className="px-6 pt-6">{tools}</div>}

    <div className="my-6 mx-6 flex grow divide-x-0 rounded border bg-white p-6 shadow lg:divide-x">
      {items &&
        (responsive ? (
          <div className="hidden lg:block">
            <div className="shrink-0">
              <ul className="w-80 space-y-2 pr-6">{items}</ul>
            </div>
          </div>
        ) : (
          <div className="shrink-0">
            <ul className="w-80 space-y-2 pr-6">{items}</ul>
          </div>
        ))}
      <div className="flex grow pl-0 lg:pl-6">{children}</div>
    </div>
  </div>
);

export default ListLayout;
