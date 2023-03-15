import { Session } from "@supabase/supabase-js";
import { supabaseClient } from "supabase/client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Auth = {
  session: Session | null | undefined;
};

const SupabaseAuthContext = createContext<Auth | undefined>(undefined);

const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>();

  useEffect(() => {
    setSession(supabaseClient.auth.session());

    const { data } = supabaseClient.auth.onAuthStateChange((_, session) =>
      setSession(session)
    );

    return () => {
      data?.unsubscribe();
    };
  }, []);

  const auth = useMemo(() => ({ session }), [session]);

  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthProvider;

export const useSupabaseAuth = () => {
  const auth = useContext(SupabaseAuthContext);

  if (auth === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  }

  return auth;
};
