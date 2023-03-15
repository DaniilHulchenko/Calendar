import { createContext, Fragment, ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseAuth } from "./SupabaseAuthProvider";
import RoleProvider, { useRole } from "./RoleProvider";
import RoleUser from "role/RoleUser";
import { motion, Variants } from "framer-motion";
import { useTranslation } from "components/translation";
import SolidCalendarIcon from "@heroicons/react/solid/CalendarIcon";
import OutlineCalendarIcon from "@heroicons/react/outline/CalendarIcon";
import { UserIcon, PuzzleIcon, UsersIcon } from "@heroicons/react/outline";
import roleLabels from "role/roleLabels";
import SidebarLink from "components/layout/SidebarLink";
import CellProvider from "./CellProvider";
import classNames from "classnames";

const SupabaseUserContext = createContext<RoleUser | undefined>(undefined);

const SupabaseUserProvider = ({ requireAuth, children }: { requireAuth: boolean | undefined; children: ReactNode }) => {
  const router = useRouter();
  const auth = useSupabaseAuth();

  useEffect(() => {
    /** @todo use rendering instead of redirect */
    if (requireAuth && auth.session === null) {
      router.push("/login");
    }
  }, [auth.session, requireAuth, router]);

  if (!requireAuth) {
    return <Fragment>{children}</Fragment>;
  }

  if (!auth.session || !auth.session.user) {
    return null;
  }

  return (
    <SupabaseUserContext.Provider value={auth.session.user}>
      <RoleProvider>
        <CellProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </CellProvider>
      </RoleProvider>
    </SupabaseUserContext.Provider>
  );
};

export default SupabaseUserProvider;

export const useSupabaseUser = () => {
  const user = useContext(SupabaseUserContext);

  if (user === undefined) {
    throw new Error("useSupabaseUser must be used within a SupabaseUserProvider");
  }

  return user;
};

const storageKey = "sidebar_pinned";

function SidebarLayout({ children }: { children: ReactNode }) {
  const t = useTranslation();
  const role = useRole();

  return (
    <div className=" flex h-screen overflow-hidden sm:mb-0">
      {open !== undefined && (
        <motion.nav
          className={classNames(
            "absolute bottom-0 z-30 max-h-screen w-full shrink-0 overflow-hidden border-r border-indigo-800 bg-indigo-900 shadow-2xl sm:static sm:mt-0 sm:w-[80px] lg:w-[240px]",
          )}
          whileHover={"opened"}
        >
          <div className="flex h-full w-auto items-center justify-center sm:flex-col sm:items-start lg:w-60">
            <div className="flex items-center gap-1 py-2 px-3 sm:py-7 lg:px-5">
              <div className="flex grow flex-wrap items-center justify-center gap-3 lg:flex-nowrap">
                <motion.div
                  className="flex hidden items-center justify-center rounded-xl bg-indigo-500 p-2 sm:block"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "just" }}
                >
                  <SolidCalendarIcon className="h-7 w-7 text-white" />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "just" }}
                >
                  <h1 className="text-md hidden font-bold text-white lg:block lg:text-lg">{t("Shift plan")}</h1>

                  <div className=" ml-2 text-sm font-bold text-white sm:ml-0 sm:px-0 sm:font-semibold sm:text-indigo-300 lg:m-0">
                    Zaruba Denys
                    {/* {roleLabels[role]} */}
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              className="max-w-sm py-2 sm:w-full sm:grow sm:py-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "just" }}
            >
              <SidebarLink href="/week" icon={<OutlineCalendarIcon />} text={t("Calendar")} />
            </motion.div>

            <AdminNavigation />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "just" }}
              className="max-w-sm py-2 sm:w-full sm:py-6"
            >
              <SidebarLink href="/profile" icon={<UserIcon />} text={t("Profile")} />
            </motion.div>
          </div>
        </motion.nav>
      )}

      <div className="grow">{children}</div>
    </div>
  );
}

function AdminNavigation() {
  const t = useTranslation();

  return (
    <motion.div
      className="flex py-2 sm:block sm:w-full sm:py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "just" }}
    >
      <Fragment>
        <SidebarLink href="/trainers" icon={<UsersIcon />} text={t("Trainers")} />

        <SidebarLink href="/program-blocks" icon={<PuzzleIcon />} text={t("Program blocks")} />
      </Fragment>
    </motion.div>
  );
}
