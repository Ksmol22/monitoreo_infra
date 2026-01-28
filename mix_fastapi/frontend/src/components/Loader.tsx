import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-circle">
        <Loader2 className="loader-icon" />
      </div>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex justify-center p-4">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );
}
