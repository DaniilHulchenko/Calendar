import "react-datepicker/dist/react-datepicker.css";
import "../styles/globals.css";
import "tailwind-config/global.css";
import type { AppProps } from "next/app";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import store from "data/redux/store";
import SupabaseUserProvider from "components/auth/SupabaseUserProvider";
import toast, { Toaster } from "react-hot-toast";
import { Fragment, useEffect, useState } from "react";
import Head from "next/head";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SupabaseAuthProvider from "components/auth/SupabaseAuthProvider";
import AppPageProps from "ui/AppPageProps";
import { useTranslation } from "components/translation";

const CalendarApp = ({ Component, pageProps }: AppProps<AppPageProps>) => {
  const t = useTranslation();
  const appPageProps: AppPageProps = pageProps;

  const [queryClient, setQueryClient] = useState<QueryClient>();

  useEffect(() => {
    const onError = (error: unknown) => {
      toast.error(error instanceof Error ? error.message : t("Something went wrong"));
    };

    setQueryClient(
      new QueryClient({
        queryCache: new QueryCache({ onError }),
        mutationCache: new MutationCache({ onError }),
      }),
    );
  }, [t]);

  return (
    <Fragment>
      <Head>
        <title>{t("Shift plan")}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {queryClient && (
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <SupabaseAuthProvider>
              <SupabaseUserProvider requireAuth={appPageProps.requireAuth ?? true}>
                <Component {...appPageProps} />
              </SupabaseUserProvider>
            </SupabaseAuthProvider>

            <Toaster />
          </Provider>

          <ReactQueryDevtools position="bottom-right" />
        </QueryClientProvider>
      )}
    </Fragment>
  );
};

export default CalendarApp;
