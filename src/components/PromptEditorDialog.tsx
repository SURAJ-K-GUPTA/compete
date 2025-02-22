import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiEdit } from 'react-icons/fi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (systemPrompt: string, userPrompt: string) => void;
  initialSystemPrompt: string;
  initialUserPrompt: string;
}

export default function PromptEditorDialog({
  isOpen,
  onClose,
  onSave,
  initialSystemPrompt,
  initialUserPrompt
}: Props) {
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [userPrompt, setUserPrompt] = useState(initialUserPrompt);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
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
            <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
              <Dialog.Title className="text-lg font-medium mb-4">Edit Prompts</Dialog.Title>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">System Prompt</label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">User Prompt</label>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave(systemPrompt, userPrompt)}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  Save
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
} 