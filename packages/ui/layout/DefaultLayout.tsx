import { ReactNode } from "react";
import { motion } from "framer-motion";

const DefaultLayout = ({
  icon,
  title,
  description,
  children,
  buttons,
  navigation,
}: {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  buttons?: ReactNode;
  navigation?: ReactNode;
}) => (
  <main className="flex min-h-screen flex-col pb-[60px] sm:pb-0">
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap px-6 pb-2 pt-6">
        <div className="grow">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-8 w-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "just" }}
            >
              {icon}
            </motion.div>

            <motion.h1
              className="text-2xl font-semibold md:text-3xl"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "just" }}
            >
              {title ? title : <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />}
            </motion.h1>
          </div>

          <motion.p
            className="py-2 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {description ? description : <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />}
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          {buttons}
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl">{navigation}</div>
    </header>

    <div className="relative grow overflow-auto">
      <div className="absolute w-full">
        <div className="mx-auto h-full w-full max-w-5xl">{children}</div>
      </div>
    </div>
  </main>
);

export default DefaultLayout;
