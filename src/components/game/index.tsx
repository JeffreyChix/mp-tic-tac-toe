"use client";

import { useEffect, useState } from "react";
import { useSearchParams, redirect } from "next/navigation";
import clsx from "clsx";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { getPosition } from "@/lib/game/utils";
import { usePlayLogic } from "@/hooks/usePlayLogic";
import { Cell } from "./cell";
import { Nav } from "./nav";
import { RenderDialog } from "../render-dialog";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { useSocket } from "@/hooks/useSocket";
import { PLAYER_JOINED } from "@/lib/socket/utils";
import type { Player } from "../../../type";

import styles from "@/app/board.module.scss";
import { ActionTypes } from "@/contexts/game-session/reducer";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { NEXT_PUBLIC_URL } from "@/lib/utils";

export const Board = ({ id }: { id?: string }) => {
  const {
    session,
    dispatch,
    board,
    getCellClassName,
    handleCellClick,
    resetBoard,
    gameOver,
  } = usePlayLogic(id);

  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const [openWaiting, setOpenWaiting] = useState(false);

  useEffect(() => {
    if (id && session.gameMode !== "modeLive") {
      redirect("/");
    }
  }, [id, session.gameMode]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!id || session.gameMode !== "modeLive") return;

    setOpenWaiting(session.player.type === "creator");
    socket.on(PLAYER_JOINED, (opponent: Player) => {
      dispatch({
        type: ActionTypes.INIT_PLAYER,
        payload: { key: "opponent", player: opponent },
      });
      setOpenWaiting(false);
    });
  }, [dispatch, id, session.gameMode, session.player.type, socket]);

  const { isCopied, copyToClipboard } = useCopyToClipboard({
    onCopy: () => toast("Send to your friend 🔥", { duration: 5000 }),
  });

  const boardLink = `${NEXT_PUBLIC_URL}/join-board/${id}`;

  return (
    <>
      <section className={styles.wrapper}>
        <section className={styles.board_section}>
          <div className={styles.board}>
            {board.map((cell: string | null, index: number) => {
              return (
                <Cell
                  key={`cell-${index}`}
                  position={getPosition(index)}
                  symbol={cell}
                  className={getCellClassName(index)}
                  onClick={() => handleCellClick(cell, index)}
                />
              );
            })}
          </div>
          <div
            className={clsx(styles.restart, gameOver && styles.show)}
            onClick={resetBoard}
          />
        </section>
        <Nav />
      </section>

      <RenderDialog open={openWaiting} hideCloseBtn>
        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="w-full py-3 px-4 shadow-current-theme border-0 bg-current-theme my-5 grid place-items-center rounded-lg">
            <div className="flex items-center gap-2 text-lg select-none">
              <Loader className="h-6 w-6 animate-spin" />
              <span>Waiting for player 2</span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-3">
            <span className="capitalize">{`${name}'s board`}</span>
            <Separator orientation="vertical" className="bg-current-theme" />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(boardLink)}
            >
              {isCopied ? "Link Copied ✔" : "Invite Player"}
            </Button>
          </div>

          <div className="mt-5">
            <Separator />
            <Button variant="link" title="End board connection!">
              Close Board
            </Button>
          </div>
        </div>
      </RenderDialog>
    </>
  );
};
