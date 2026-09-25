import { AlertCircle } from "lucide-react";

interface AlertProps {
  message: string;
}

export default function Alert({ message }: AlertProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

      <p className="text-sm leading-6 text-red-700">
        {message}
      </p>
    </div>
  );
}