import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const SidebarLink = ({
  href,
  icon,
  text,
}: {
  href: string;
  icon: ReactNode;
  text: string;
}) => {
  const router = useRouter();
  const active = router.pathname.startsWith(href);

  return (
    <div className="px-3 sm:px-5 sm:py-1">
      <Link href={href}>
        <a
          className={classNames(
            "flex space-x-2 px-2 py-2 font-semibold transition",
            !active && "text-indigo-300",
            active && "rounded bg-white/20 text-white",
            "hover:text-white"
          )}
        >
          <div className="h-6 w-6 ">{icon}</div>
          <div className="hidden lg:block">{text}</div>
        </a>
      </Link>
    </div>
  );
};

export default SidebarLink;
