import { UserIcon } from "@heroicons/react/outline";
import { LogoutIcon } from "@heroicons/react/solid";
import { supabaseClient } from "supabase/client";
import Button from "ui/buttons/Button";
import DefaultLayout from "ui/layout/DefaultLayout";
import { useTranslation } from "components/translation";
import GeneralSection from "components/profile/sections/general";
import TrainerContainer from "components/profile/trainer";

export default function ProfilePage() {
  const t = useTranslation();

  return (
    <DefaultLayout
      icon={<UserIcon />}
      title={t("Profile")}
      description={t("View and edit your profile")}
      buttons={
        <Button
          icon={<LogoutIcon />}
          onClick={() => supabaseClient.auth.signOut()}
          variant="outlined"
        >
          {t("Sign out")}
        </Button>
      }
    >
      <div className="flex h-full flex-col divide-y px-6">
        <GeneralSection />
        <TrainerContainer />
      </div>
    </DefaultLayout>
  );
}
