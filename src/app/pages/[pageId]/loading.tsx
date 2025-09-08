import { CircleLoading } from "@/components/CircleLoading";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="w-full grid place-items-center min-h-screen">
      <CircleLoading />
    </div>
  );
}
