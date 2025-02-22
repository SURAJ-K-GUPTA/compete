import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
  agentName: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteAgentDialog({ agentName, isOpen, onConfirm, onCancel }: Props) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onCancel} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <FiAlertTriangle size={24} />
                <Dialog.Title className="text-lg font-medium">Delete Agent</Dialog.Title>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">{agentName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
} 