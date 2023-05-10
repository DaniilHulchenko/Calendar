import { useTranslation } from "components/translation";
import useTrainerMutation from "loading/mutations/useTrainerMutation";
import useTrainerQuery from "loading/queries/useTrainerQuery";
import { Fragment, useCallback } from "react";
import toast from "react-hot-toast";
import LoadingButton from "ui/buttons/LoadingButton";
import { DashedContainer } from "./layout";
import { PlusIcon } from "@heroicons/react/solid";
import BioSection from "./sections/bio";
import SkillsSection from "./sections/skills";
import AvailSection from "./sections/avails";
import ProgramBlockSection from "./sections/program-blocks";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import { supabaseClient } from "supabase/client";

function TrainerContainer() {
    const t = useTranslation();
    const trainerQuery = useTrainerQuery();
    const trainerMutation = useTrainerMutation();
    const user = useSupabaseUser();
    const handleCreateClick = useCallback(async () => {
        await supabaseClient.from("profiles").insert({ id: user.id }).single();
        await supabaseClient.from("trainers").insert({ id: user.id }).single();
        // await trainerMutation.mutateAsync({});
        toast.success(t("Trainer profile created"));
        trainerQuery.refetch();
    }, [t, trainerMutation]);

    if (!trainerQuery.data && !trainerQuery.isLoading) {
        return (
            <div className="py-6">
                <DashedContainer className="h-64">
                    <LoadingButton
                        icon={<PlusIcon />}
                        variant="contained"
                        loading={trainerMutation.isLoading}
                        onClick={handleCreateClick}
                    >
                        {t("Create trainer profile")}
                    </LoadingButton>
                </DashedContainer>
            </div>
        );
    }

    return (
        <Fragment>
            <BioSection />
            <SkillsSection />
            <AvailSection />
            <ProgramBlockSection />
        </Fragment>
    );
}

export default TrainerContainer;
