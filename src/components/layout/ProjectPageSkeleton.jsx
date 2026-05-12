import Spinner from "@/components/ui/Spinner.jsx";

export default function ProjectPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Row 1 skeleton: breadcrumb + utility placeholders */}
      <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
          <span className="text-gray-200">/</span>
          <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-20 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-7 w-24 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
      {/* Row 2 skeleton: tab strip */}
      <div className="flex h-9 flex-shrink-0 items-end gap-1 border-b border-gray-200 bg-white px-4">
        {[40, 52, 36, 64, 36, 72].map((w, i) => (
          <div
            key={i}
            className="mb-2 animate-pulse rounded bg-gray-100"
            style={{ width: w, height: 16 }}
          />
        ))}
      </div>
      {/* Content spinner */}
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-6 w-6 text-blue-500" />
      </div>
    </div>
  );
}
