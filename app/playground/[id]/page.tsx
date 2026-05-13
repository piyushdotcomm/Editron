import { Suspense } from "react";
import PlaygroundSkeleton from "@/modules/playground/components/loader";
import MainPlaygroundPage from "@/modules/playground/components/MainPlaygroundPage";
import { getPlaygroundById } from "@/modules/playground/actions";

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getPlaygroundById(params.id);

  return (
    <Suspense fallback={<PlaygroundSkeleton />}>
      <MainPlaygroundPage initialData={data} id={params.id} />
    </Suspense>
  );
}