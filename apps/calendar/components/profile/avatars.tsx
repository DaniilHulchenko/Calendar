import classNames from "classnames";
import { useSupabaseUser } from "components/auth/SupabaseUserProvider";
import ProfileAvatar from "components/layout/ProfileAvatar";
import { useTranslation } from "components/translation";
import { motion } from "framer-motion";
import {
  ChangeEventHandler,
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";
import {
  Avatar,
  createAvatarsKey,
  insertAvatar,
  updateTrainers,
  useAvatarDeleteMutation,
  useAvatarsQuery,
} from "supabase/avatars.table";
import { useProfileMutation, useProfileQuery } from "supabase/profiles.table";
import DefaultDialog from "ui/dialog/DefaultDialog";
import InfoBlock from "ui/InfoBlock";
import * as SliderPrimitive from "@radix-ui/react-slider";
import DefaultDialogButtons from "ui/dialog/DefaultDialogButtons";
import FileButton from "components/buttons/FileButton";
import { PlusIcon, UploadIcon, TrashIcon, StarIcon } from "@heroicons/react/solid";
import Button from "ui/buttons/Button";
import { XIcon } from "@heroicons/react/outline";
import Badge from "components/layout/Badge";
import Carousel from "components/layout/Carousel";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as uuid from "uuid";
import { uploadAvatar, useAvatarRemoveFileMutation } from "supabase/avatars.storage";
import LoadingButton from "ui/buttons/LoadingButton";
import _ from "lodash";

function AvatarList() {
  const t = useTranslation();
  const { id: userId } = useSupabaseUser();

  const { isLoading: avatarsAreLoading, data: avatars } = useAvatarsQuery(userId);

  const { data: profile } = useProfileQuery(userId);

  const [editorOpen, setEditorOpen] = useState(false);

  const mainAvatar = useMemo(() => {
    return avatars?.find((avatar) => avatar.id === profile?.avatar_id);
  }, [avatars, profile?.avatar_id]);

  const otherAvatars = useMemo(() => {
    return avatars?.filter((avatar) => avatar.id !== mainAvatar?.id);
  }, [avatars, mainAvatar?.id]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerIsWider, setContainerIsWider] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current || !buttonRef.current) {
      return;
    }

    setContainerIsWider(containerRef.current.offsetWidth > buttonRef.current.offsetWidth);
  }, [avatars?.length]);

  return (
    <Fragment>
      <button
        className={classNames(
          "flex grow overflow-hidden rounded-lg border border-gray-200 px-2 transition hover:border-indigo-400 hover:ring-1 hover:ring-indigo-400",
          containerIsWider ? "justify-start" : "justify-center",
        )}
        ref={buttonRef}
        onClick={() => setEditorOpen(true)}
        style={{ minHeight: "120px" }}
      >
        <div className="flex items-center -space-x-20" ref={containerRef}>
          {avatarsAreLoading && (
            <Fragment>
              <ProfileAvatar skeleton />
              <ProfileAvatar skeleton />
              <ProfileAvatar skeleton />
            </Fragment>
          )}

          {avatars?.length === 0 && <InfoBlock>{t("No avatars yet")}</InfoBlock>}

          {mainAvatar && <ProfileAvatar url={mainAvatar.url} />}

          {otherAvatars?.map((avatar, index) => (
            <div key={avatar.id} className="relative" style={{ zIndex: -(index + 1) }}>
              <div className="absolute inset-0 rounded-full bg-white" />
              <ProfileAvatar url={avatar.url} opacity={0.5} />
            </div>
          ))}
        </div>
      </button>

      <AvatarDialog open={editorOpen} onClose={() => setEditorOpen(false)} />
    </Fragment>
  );
}

export default AvatarList;

function AvatarDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslation();
  const avatarEditorRef = useRef<AvatarEditor>(null);

  const [file, setFile] = useState<File>();
  const [scale, setScale] = useState<number>(1);
  const [blob, setBlob] = useState<Blob | null>();
  const [avatar, setAvatar] = useState<Avatar | null>();
  const [index, setIndex] = useState<number | null>();

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      toast.error(t("No file selected"));
      return;
    }

    setFile(event.target.files[0]);
  };

  const handleClose = useCallback(() => {
    setFile(undefined);
    setScale(1);
    onClose();
  }, [onClose]);

  const updateBlob = useMemo(() => _.debounce(() => avatarEditorRef.current?.getImage().toBlob(setBlob), 300), []);

  useEffect(() => {
    return () => {
      updateBlob.cancel();
    };
  }, [updateBlob]);

  const handleAvatarCarouselChange = useCallback((avatar: Avatar | null, index: number | null) => {
    setAvatar(avatar);
    setIndex(index);
  }, []);

  return (
    <DefaultDialog
      show={open}
      onClose={handleClose}
      title={t("Avatar editor")}
      description={t("Upload, crop and delete your avatar")}
    >
      <div className="h-72">
        {!file && (
          <div className="flex h-full flex-col items-center">
            <AvatarCountBadge index={index} />
            <AvatarCarousel onChange={handleAvatarCarouselChange} />
            <AvatarMainBadge avatar={avatar} />
          </div>
        )}

        {file && (
          <motion.div className="flex h-full flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AvatarEditor
              ref={avatarEditorRef}
              className="mx-auto"
              image={file}
              width={160}
              height={160}
              borderRadius={9999}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={scale}
              onImageReady={updateBlob}
              onImageChange={updateBlob}
            />

            <div className="flex grow items-center justify-center">
              <Slider value={scale} onChange={(value) => setScale(value)} />
            </div>
          </motion.div>
        )}
      </div>

      <DefaultDialogButtons className="flex items-center gap-3">
        {!file && (
          <Fragment>
            <FileButton
              icon={<PlusIcon />}
              variant="contained"
              accept="image/*"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onChange={handleFileChange}
            >
              {t("Add")}
            </FileButton>

            {avatar && (
              <Fragment>
                <AvatarRemoveButton avatar={avatar} />
                <AvatarMakeMainButton avatar={avatar} />
              </Fragment>
            )}
          </Fragment>
        )}

        {file && (
          <Fragment>
            {blob && <AvatarUploadButton filename={file.name} blob={blob} onUploaded={() => setFile(undefined)} />}

            <Button
              icon={<XIcon />}
              variant="outlined"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setFile(undefined)}
            >
              {t("Abort")}
            </Button>
          </Fragment>
        )}
      </DefaultDialogButtons>
    </DefaultDialog>
  );
}

function AvatarCountBadge({ index }: { index: number | null | undefined }) {
  const { id: userId } = useSupabaseUser();
  const { data: avatars } = useAvatarsQuery(userId);

  return (
    <div className="flex h-14 w-full items-start justify-end pt-3 pr-3">
      {index !== null && index !== undefined && avatars && <Badge>{`${index + 1}/${avatars.length}`}</Badge>}
    </div>
  );
}

function AvatarCarousel({
  onChange,
}: {
  /** Should be react callback */
  onChange: (avatar: Avatar | null, index: number | null) => void;
}) {
  const t = useTranslation();
  const user = useSupabaseUser();
  const avatarsQuery = useAvatarsQuery(user.id);

  useEffect(() => {
    if (!avatarsQuery.data || avatarsQuery.data.length === 0) {
      onChange(null, null);
    }
  }, [avatarsQuery.data, onChange]);

  const handleCarouselChange = useCallback(
    (index: number) => {
      onChange(avatarsQuery.data ? avatarsQuery.data[index] : null, index);
    },
    [avatarsQuery.data, onChange],
  );

  return (
    <Fragment>
      <Carousel noControls={avatarsQuery.isLoading || avatarsQuery.data?.length === 0} onChange={handleCarouselChange}>
        {avatarsQuery.isLoading && <ProfileAvatar skeleton={true} className="mx-auto" />}

        {avatarsQuery.data?.length === 0 && <InfoBlock>{t("Add an avatar")}</InfoBlock>}

        {avatarsQuery.data?.map((avatar) => (
          <ProfileAvatar key={avatar.id} url={avatar.url} skeleton={false} className="mx-auto" />
        ))}
      </Carousel>
    </Fragment>
  );
}

function AvatarMainBadge({ avatar }: { avatar: Avatar | null | undefined }) {
  const t = useTranslation();

  const user = useSupabaseUser();
  const profileQuery = useProfileQuery(user.id);

  return (
    <div className="h-14">
      {avatar && avatar.id === profileQuery.data?.avatar_id && (
        <Badge initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {t("Main")}
        </Badge>
      )}
    </div>
  );
}

function Slider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <SliderPrimitive.Root
      min={1}
      max={4}
      step={0.1}
      aria-label="value"
      className="relative flex h-5 w-64 touch-none items-center"
      value={[value]}
      onValueChange={(values) => onChange(values[0])}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-indigo-700">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-indigo-500" />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb
        className={classNames(
          "block h-5 w-5 rounded-full bg-indigo-500",
          "focus:outline-none focus-visible:ring focus-visible:ring-indigo-400 focus-visible:ring-opacity-75",
        )}
      />
    </SliderPrimitive.Root>
  );
}

function AvatarUploadButton({ filename, blob, onUploaded }: { filename: string; blob: Blob; onUploaded: () => void }) {
  const t = useTranslation();
  const user = useSupabaseUser();
  const queryClient = useQueryClient();
  const profileMutation = useProfileMutation(user.id);

  const avatarUploadMutation = useMutation(async () => {
    const ext = filename.split(".").pop();
    const uniqueFilename = `${uuid.v4()}.${ext}`;
    const url = `${user.id}/${uniqueFilename}`;

    const { error } = await uploadAvatar(url, blob);

    if (error) {
      throw new Error(error.message);
    }

    const avatarResponse = await insertAvatar({
      url,
      profile_id: user.id,
      // avatar_id: user.id,
    });

    if (avatarResponse.error) {
      throw new Error(avatarResponse.error.message);
    }
    updateTrainers(avatarResponse.data.avatar_id, avatarResponse.data.profile_id);
    queryClient.setQueryData<Avatar[]>(createAvatarsKey(user.id), (oldAvatars = []) => [
      ...oldAvatars,
      avatarResponse.data,
    ]);

    await profileMutation.mutateAsync({
      id: user.id,
      avatar_id: +avatarResponse.data.id,
    });
  });

  const handleClick = useCallback(async () => {
    await avatarUploadMutation.mutateAsync();
    toast.success(t("Avatar updated"));
    onUploaded();
  }, [avatarUploadMutation, onUploaded, t]);

  return (
    <LoadingButton
      icon={<UploadIcon />}
      loading={avatarUploadMutation.isLoading}
      variant="contained"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleClick}
    >
      {t("Upload")}
    </LoadingButton>
  );
}

function AvatarRemoveButton({ avatar }: { avatar: Avatar }) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { id: userId } = useSupabaseUser();
  const { data: profile } = useProfileQuery(userId);

  const {
    mutate: updateProfile,
    reset: resetUpdatedProfile,
    data: updatedProfile,
    isLoading: isUpdatingProfile,
  } = useProfileMutation(userId);

  const { data: avatars } = useAvatarsQuery(userId);

  const {
    mutate: removeFile,
    reset: resetRemovedFiles,
    data: removedFiles,
    isLoading: isRemovingFile,
  } = useAvatarRemoveFileMutation();

  const {
    mutate: deleteAvatar,
    reset: resetDeletedAvatar,
    data: deletedAvatar,
    isLoading: isDeletingAvatar,
  } = useAvatarDeleteMutation();

  useEffect(() => {
    if (!removedFiles) {
      return;
    }

    resetRemovedFiles();

    if (!avatars) {
      throw new Error("No avatars found");
    }

    if (!profile) {
      throw new Error("No profile found");
    }

    if (profile.avatar_id === avatar.id) {
      const newAvatars = avatars.filter(({ id }) => id !== avatar.id);
      const mainAvatarId = newAvatars.length === 0 ? null : newAvatars[0].id;

      updateProfile({
        id: userId,
        avatar_id: mainAvatarId !== null ? +mainAvatarId : 0,
      });

      return;
    }

    deleteAvatar(+avatar.id);
  }, [avatar.id, avatars, deleteAvatar, profile, removedFiles, resetRemovedFiles, updateProfile, userId]);

  useEffect(() => {
    if (!updatedProfile) {
      return;
    }

    resetUpdatedProfile();

    deleteAvatar(+avatar.id);
  }, [avatar.id, deleteAvatar, resetUpdatedProfile, updatedProfile]);

  useEffect(() => {
    if (!deletedAvatar) {
      return;
    }

    resetDeletedAvatar();

    queryClient.setQueryData<Avatar[]>(createAvatarsKey(userId), (oldAvatars = []) =>
      oldAvatars.filter(({ id }) => id !== avatar.id),
    );

    toast.success(t("Avatar removed"));
  }, [avatar.id, deletedAvatar, queryClient, resetDeletedAvatar, t, userId]);

  return (
    <LoadingButton
      icon={<TrashIcon />}
      loading={isRemovingFile || isUpdatingProfile || isDeletingAvatar}
      variant="outlined"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => removeFile(avatar)}
    >
      {t("Delete")}
    </LoadingButton>
  );
}

function AvatarMakeMainButton({ avatar }: { avatar: Avatar }) {
  const t = useTranslation();
  const userId = avatar.profile_id;

  const profileQuery = useProfileQuery(userId);
  const profileMutation = useProfileMutation(userId);

  const handleClick = useCallback(async () => {
    await profileMutation.mutateAsync({
      id: userId,
      avatar_id: +avatar.id,
    });

    toast.success(t("Set avatar as main avatar"));
  }, [avatar.id, profileMutation, t, userId]);

  if (!profileQuery.data || profileQuery.data.avatar_id === avatar.id) {
    return null;
  }

  return (
    <LoadingButton
      icon={<StarIcon />}
      loading={profileMutation.isLoading}
      variant="outlined"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleClick}
    >
      {t("Make main")}
    </LoadingButton>
  );
}
