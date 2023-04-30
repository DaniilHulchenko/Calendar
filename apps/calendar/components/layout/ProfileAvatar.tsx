import { UserCircleIcon } from "@heroicons/react/outline";
import classNames from "classnames";
import Image from "next/image";
import { Fragment, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getAvatarUrl } from "supabase/avatars.storage";
import _ from "lodash";

const ProfileAvatar = ({
  url,
  small,
  className,
  skeleton,
  opacity = 1,
}: {
  url?: string;
  small?: boolean;
  className?: string;
  skeleton?: boolean;
  opacity?: number;
}) => {
  const queryClient = useQueryClient();
  const urlQuery = useQuery({
    queryKey: ["avatars-storage", url],
    queryFn: () => getAvatarUrl(url),
  });
  let u;
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.type === "removed" &&
        _.isEqual(event.query.queryKey, ["avatars-storage", url]) &&
        urlQuery.data
      ) {
        URL.revokeObjectURL(url ? url : urlQuery.data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [urlQuery.data, queryClient, url]);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity, scale: 1 }}
      className={classNames(
        "flex shrink-0 items-center justify-center",
        "overflow-hidden rounded-full text-indigo-400 shadow-inner transition",
        small ? "h-10 w-10" : "h-40 w-40",
        className
      )}
    >
      {skeleton || urlQuery.isLoading ? (
        <div className="h-full w-full animate-pulse rounded-full bg-gray-200" />
      ) : (
        <Fragment>
          {urlQuery.data ? (
            <Image
              src={urlQuery.data}
              alt="Avatar"
              width={160}
              height={160}
              className="block"
            />
          ) : (
            <UserCircleIcon className="h-10 w-10" />
          )}
        </Fragment>
      )}
    </motion.div>
  );
};

export default ProfileAvatar;
