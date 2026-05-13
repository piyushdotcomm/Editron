import { Suspense } from "react";
import PlaygroundSkeleton from "@/modules/playground/components/loader";
import MainPlaygroundPage from "@/modules/playground/components/MainPlaygroundPage";

export default function Page() {
  return (
    <Suspense fallback={<PlaygroundSkeleton />}>
      <MainPlaygroundPage />
    </Suspense>
  );
}
