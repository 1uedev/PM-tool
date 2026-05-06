import Spinner from "@/components/ui/Spinner.jsx";

export default function GraphLoading() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-14 flex-shrink-0 items-center border-b border-gray-200 bg-white px-4">
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
      </header>
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-6 w-6 text-blue-500" />
      </div>
    </div>
  );
}
