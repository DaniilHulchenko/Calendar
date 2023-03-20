import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import DetailsListItem from "components/panel/details/DetailsListItem";
import { useTranslation } from "components/translation";
import _ from "lodash";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useProfileMutation, useProfileQuery } from "supabase/profiles.table";
import InputControl from "ui/form/InputControl";
import AvatarList from "../avatars";
import { ProfileSection } from "../layout";

/** @todo use graphql */
function GeneralSection() {
  const t = useTranslation();
  const user = useSupabaseUser();
  const profileQuery = useProfileQuery(user.id);
  const profileMutation = useProfileMutation(user.id);
  const form = useForm<GeneralFieldValues>();

  useEffect(() => {
    if (profileQuery.data) {
      form.reset({
        name: profileQuery.data?.name || "",
        contact: profileQuery.data?.contact || "",
      });
    }
  }, [form, profileQuery.data]);

  const updateProfile = useMemo(
    () =>
      _.debounce(async (values: GeneralFieldValues) => {
        await profileMutation.mutateAsync({
          id: user.id,
          name: values.name,
          contact: values.contact,
          updated_at: new Date(),
        });

        toast.success(t("General profile updated"));
      }, 1000),
    [profileMutation, t, user.id]
  );

  useEffect(() => {
    return () => {
      updateProfile.cancel();
    };
  }, [updateProfile]);

  useEffect(() => {
    const subscription = form.watch(() => form.handleSubmit(updateProfile)());

    return () => {
      subscription.unsubscribe();
    };
  }, [form, updateProfile]);

  return (
    <ProfileSection
      title={t("General Info")}
      description={t("That's how others will see you on the site")}
    >
      <div className="flex w-full flex-wrap gap-6 lg:flex-nowrap">
        <form className="shrink-0 space-y-3">
          <DetailsListItem label="Email" value={user.email} />

          <InputControl
            {...form.register("name")}
            label={t("Name")}
            type="text"
            skeleton={profileQuery.isLoading}
          />

          <InputControl
            {...form.register("contact")}
            label={t("Contact")}
            type="text"
            skeleton={profileQuery.isLoading}
          />
        </form>

        <AvatarList />
      </div>
    </ProfileSection>
  );
}

export default GeneralSection;

type GeneralFieldValues = {
  name: string;
  contact: string;
};
