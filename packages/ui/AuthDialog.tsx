import { ReactNode } from "react";
import { motion } from "framer-motion";

const AuthDialog = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
  <div className="fixed inset-0 z-10 overflow-y-auto">
    <div className="flex min-h-screen items-center justify-center">
      <motion.div
        className="relative mx-10 flex flex-row flex-wrap justify-center rounded-lg  bg-white py-10 shadow-2xl md:divide-x lg:flex-nowrap"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "just" }}
      >
        <div className="flex items-center justify-center px-10 md:px-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "just" }}
          >
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
            <p>{subtitle}</p>
          </motion.div>
        </div>

        <div className="flex items-center justify-center px-10 md:px-20">{children}</div>
      </motion.div>
    </div>
  </div>
);

export default AuthDialog;
