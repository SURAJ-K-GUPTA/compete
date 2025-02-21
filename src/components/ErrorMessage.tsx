interface Props {
  message: string;
}

/**
 * Error display component for user feedback
 * Shows validation errors and API failures with clear messaging
 */
export default function ErrorNotification({ message }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p>{message}</p>
    </div>
  );
} 