import SwitchControl from "components/form/SwitchControl";
import TextareaControl from "components/form/TextareaControl";
import { useTranslation } from "components/translation";
import useTrainerMutation from "loading/mutations/useTrainerMutation";
import useTrainerQuery from "loading/queries/useTrainerQuery";
import _ from "lodash";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ProfileSection } from "../layout";

function BioSection() {
  const t = useTranslation();
  const trainerQuery = useTrainerQuery();
  const trainerMutation = useTrainerMutation();
  const form = useForm<BioFieldValues>();

  useEffect(() => {
    if (trainerQuery.data) {
      form.reset({
        aboutMe: trainerQuery.data.about_me || "",
        drivingLicense: trainerQuery.data.driving_license || false,
        dlrgCertificate: trainerQuery.data.dlrg_certificate || false,
        english: trainerQuery.data.english || false,
        german: trainerQuery.data.german || false,
      });
    }
  }, [form, trainerQuery.data]);

  const updateTrainer = useMemo(
    () =>
      _.debounce(async (values: BioFieldValues) => {
        await trainerMutation.mutateAsync({
          about_me: values.aboutMe,
          driving_license: values.drivingLicense,
          dlrg_certificate: values.dlrgCertificate,
          english: values.english,
          german: values.german,
        });

        toast.success(t("Trainer profile updated"));
      }, 1000),
    [t, trainerMutation]
  );

  useEffect(() => {
    return () => {
      updateTrainer.cancel();
    };
  }, [updateTrainer]);

  useEffect(() => {
    const subscription = form.watch(() => form.handleSubmit(updateTrainer)());

    return () => {
      subscription.unsubscribe();
    };
  }, [form, updateTrainer]);

  return (
    <ProfileSection title="Bio" description={t("Your experience as a trainer")}>
      <form className="w-full space-y-3">
        <TextareaControl
          {...form.register("aboutMe")}
          label={t("About me")}
          srLabel
          skeleton={trainerQuery.isLoading}
        />

        <div className="flex flex-wrap justify-start gap-3 sm:flex-nowrap sm:justify-between">
          <div>
            <div className="mb-2">
              <SwitchControl
                control={form.control}
                name="drivingLicense"
                label={t("Driving license")}
              />
            </div>
            <SwitchControl
              control={form.control}
              name="dlrgCertificate"
              label={t("DLRG certificate")}
            />
          </div>
          <div>
            <div className="mb-2">
              <SwitchControl
                control={form.control}
                name="english"
                label={t("English language")}
              />
            </div>
            <SwitchControl
              control={form.control}
              name="german"
              label={t("German language")}
            />
          </div>
        </div>
      </form>
    </ProfileSection>
  );
}

export default BioSection;

type BioFieldValues = {
  aboutMe: string;
  drivingLicense: boolean;
  dlrgCertificate: boolean;
  english: boolean;
  german: boolean;
};
