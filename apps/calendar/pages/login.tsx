import AuthDialog from "ui/AuthDialog";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { GetStaticProps } from "next";
import { Form, Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { SparklesIcon } from "@heroicons/react/solid";
import { supabaseClient } from "supabase/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useSupabaseAuth } from "components/auth/SupabaseAuthProvider";
import AppPageProps from "ui/AppPageProps";
// import { SubmitButton, TextField } from "components/formik";
import { useTranslation } from "components/translation";
import { SubmitButton, TextField } from "components/formik";

const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Required"),
});

type LoginValues = yup.InferType<typeof loginSchema>;

const LoginPage = () => {
  const t = useTranslation();

  const router = useRouter();
  const auth = useSupabaseAuth();

  useEffect(() => {
    if (auth.session) {
      router.push("/");
    }
  }, [auth.session, router]);

  if (auth.session === undefined || auth.session) {
    return null;
  }

  const initialValues: LoginValues = { email: "" };

  const handleEmailSubmit = async (
    values: LoginValues,
    helpers: FormikHelpers<LoginValues>
  ) => {
    const { error } = await supabaseClient.auth.signIn(
      {
        email: values.email,
      },
      {
        redirectTo: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_TO,
      }
    );

    helpers.setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t("Check your email"));
  };

  return (
    <AuthDialog
      title={t("Shift plan")}
      subtitle={t("Welcome to the shift plan")}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "just" }}
      >
        <Formik initialValues={initialValues} onSubmit={handleEmailSubmit}>
          <Form className="space-y-2">
            <TextField
              label={t("Continue with email")}
              name="email"
              type="email"
            />

            <SubmitButton icon={<SparklesIcon />}>
              {t("Get a Magic Link")}
            </SubmitButton>
          </Form>
        </Formik>
      </motion.div>
    </AuthDialog>
  );
};

export const getStaticProps: GetStaticProps<AppPageProps> = () => {
  return {
    props: {
      requireAuth: false,
    },
  };
};

export default LoginPage;
