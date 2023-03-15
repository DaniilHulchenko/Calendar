import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useRef } from "react";
import { XIcon } from "@heroicons/react/outline";
import CloseButton from "../buttons/CloseButton";

const DefaultDialog = ({
  show,
  title,
  description,
  children,
  onClose,
}: {
  show: boolean;
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
}) => {
  const closeButtonRef = useRef(null);

  return (
    <Transition show={show} as={Fragment}>
      <Dialog
        initialFocus={closeButtonRef}
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative mx-auto w-screen max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex gap-6 border-b p-6">
                <div className="grow">
                  <Dialog.Title className="font-bold">{title}</Dialog.Title>

                  <Dialog.Description className="text-sm text-gray-500">
                    {description}
                  </Dialog.Description>
                </div>

                <CloseButton ref={closeButtonRef} onClick={onClose} />
              </div>

              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DefaultDialog;
