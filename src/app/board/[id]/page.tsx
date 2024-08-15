import { Board } from "@/components/game";

export default function PrivateBoard({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <div>
      <Board id={id} />
    </div>
  );
}
