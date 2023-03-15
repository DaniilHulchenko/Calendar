import { InformationCircleIcon } from "@heroicons/react/solid";
import { motion } from "framer-motion";
import { ReactNode } from "react";

const InfoBlock = ({ children }: { children: ReactNode }) => (
  <div className="flex h-full w-full items-center justify-center">
    <motion.div
      className="flex items-center gap-2 rounded bg-indigo-200/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <InformationCircleIcon className="h-5 w-5 shrink-0 text-indigo-500" />
      {children}
    </motion.div>
  </div>
);

export default InfoBlock;
