"use client";

import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { RenderDialog } from "../render-dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { NEXT_PUBLIC_URL } from "@/lib/utils";
import { useGameSession } from "@/hooks/useGameSession";
import { ActionTypes } from "@/contexts/game-session/reducer";
import { DEFAULT_BOARD_STATE } from "@/lib/game/utils";

export function AwaitingOpponent({
  isAwaiting,
  boardId,
}: {
  boardId?: string;
  isAwaiting: boolean;
}) {
  const router = useRouter();

  const {
    session: {
      board: { player, opponent },
    },
    dispatch,
  } = useGameSession();

  const { isCopied, copyToClipboard } = useCopyToClipboard({
    onCopy: () => toast("Send to your friend 🔥", { duration: 5000 }),
  });

  const boardLink = `${NEXT_PUBLIC_URL}/join-board/${boardId}`;

  const boardCreatorName =
    player.type === "creator" ? player.username : opponent?.username;

  return (
    <RenderDialog open={isAwaiting} hideCloseBtn>
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="w-full py-3 px-4 shadow-current-theme border-0 bg-current-theme my-5 grid place-items-center rounded-lg">
          <div className="flex items-center gap-2 text-lg select-none">
            <Loader className="h-6 w-6 animate-spin" />
            <span>Waiting for player 2</span>
          </div>
        </div>
        <div className="flex justify-center items-center gap-3">
          <span className="capitalize">
            {!boardCreatorName
              ? "Tic-Tac-Toe Board"
              : `${boardCreatorName}'s Board`}
          </span>
          <Separator orientation="vertical" className="bg-current-theme" />
          {player && player.type === "creator" ? (
            <Button
              variant="outline"
              onClick={() => copyToClipboard(boardLink)}
            >
              {isCopied ? "Link Copied ✔" : "Invite Player"}
            </Button>
          ) : (
            <span>{`Ask ${boardCreatorName} to join!`}</span>
          )}
        </div>

        <div className="mt-5">
          <Separator />
          <Button
            variant="link"
            onClick={() => {
              dispatch({
                type: ActionTypes.SET_BOARD,
                payload: DEFAULT_BOARD_STATE,
              });
              router.push("/")
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </RenderDialog>
  );
}
