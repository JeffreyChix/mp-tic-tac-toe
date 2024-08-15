import { JoinBoardForm } from "@/components/game/forms/join-board";

export default function JoinBoard({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <div className="px-4 py-2">
      <p className="text-2xl font-josefin-sans">Tic-Tac-Toe</p>

      <JoinBoardForm boardId={id} />
    </div>
  );
}
