import classNames from "classnames";
import { motion, MotionStyle } from "framer-motion";
import { Fragment, ReactNode, useState } from "react";
import { usePopper } from "react-popper";
import { Popover as HeadlessPopover, Transition } from "@headlessui/react";
import CloseButton from "ui/buttons/CloseButton";
import { useTranslation } from "./translation";
import { PortalModal } from "./program-block";

export function Panel({
  className,
  children,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "overflow-hidden rounded-xl bg-white shadow-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function WorkspacePopover({
  className,
  style,
  button,
  description,
  content,
}: {
  description: ReactNode;
  className?: string;
  style?: MotionStyle;
  button: ReactNode;
  content: (close: () => void) => ReactNode;
}) {
  const t = useTranslation();

  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>();

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>();

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [-6, 0],
        },
      },
    ],
  });

  return (
    <HeadlessPopover as={Fragment}>
      {({ open }) => (
        <Fragment>
          {/** @todo fix select border */}
          <HeadlessPopover.Button
            as={motion.button}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            ref={setReferenceElement}
            className={classNames(
              "flex items-center justify-center p-1 text-sm font-semibold focus-visible:outline-none",
              open &&
                "z-10 scale-125 rounded-t shadow ring-2 ring-white transition",
              className
            )}
            style={style}
          >
            {button}
          </HeadlessPopover.Button>
          <PortalModal>
            <HeadlessPopover.Panel
              className="z-10"
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              {(arg) => (
                <Transition
                  enter="transition ease-out duration-800"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-600"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 -translate-y-4"
                >
                  <Panel className="my-2 text-base">
                    <div className="flex gap-6 border-b p-6">
                      <div className="grow">
                        <h2 className="font-bold">{t("Edit workspace")}</h2>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>

                      <CloseButton onClick={() => arg.close()} />
                    </div>

                    {content(arg.close)}
                  </Panel>
                </Transition>
              )}
            </HeadlessPopover.Panel>
          </PortalModal>
        </Fragment>
      )}
    </HeadlessPopover>
  );
}
