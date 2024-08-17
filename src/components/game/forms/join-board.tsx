"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Symbol } from "../symbol";
import { NEW_BOARD_SCHEMA } from "../../../../schema";
import { useSocket } from "@/hooks/useSocket";
import { JOIN_BOARD, VERIFY_BOARD } from "@/lib/socket/utils";
import { GameLoading } from "../loading";
import { RenderDialog } from "@/components/render-dialog";
import { BoardState, Player } from "../../../../type";
import { RogueBoard } from "../rogue-board";
import { useGameSession } from "@/hooks/useGameSession";
import { ActionTypes } from "@/contexts/game-session/reducer";

export function JoinBoardForm({ boardId }: { boardId: string }) {
  const { dispatch } = useGameSession();

  const { socket } = useSocket();

  const [boardName, setBoardName] = useState("Join Board");
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [isRogue, setIsRogue] = useState(false);
  const [alreadySelectedSymbol, setAlreadySelectedSymbol] = useState("");

  const router = useRouter();

  useEffect(() => {
    socket.emit(VERIFY_BOARD, boardId, (res: { board: BoardState }) => {
      setTimeout(() => {
        setIsGameLoading(false);
      }, 1000);

      if (!res.board) {
        setIsRogue(true);
        return;
      }
      setBoardName(`${res.board.player.username}'s Board`);
      setAlreadySelectedSymbol(res.board.player.symbol);
    });
  }, [boardId, socket]);

  const form = useForm({
    resolver: zodResolver(NEW_BOARD_SCHEMA),
    mode: "onSubmit",
  });

  const [isJoining, setIsJoining] = useState(false);

  const onSubmit = async (values: any) => {
    setIsJoining(true);
    socket.emit(
      JOIN_BOARD,
      boardId,
      values,
      (res: { status: "OK"; board: BoardState }) => {
        if (res.status === "OK") {
          dispatch({
            type: ActionTypes.SET_BOARD,
            payload: {
              ...res.board,
              player: res.board.opponent as unknown as Player,
              opponent: res.board.player,
            },
          });
          router.push(`/board/${boardId}`);
        }
      }
    );
  };

  if (isGameLoading) return <GameLoading />;

  if (!isGameLoading && isRogue) return <RogueBoard />;

  return (
    <RenderDialog open hideCloseBtn>
      <div>
        <p className="capitalize">{boardName}</p>

        <div className="my-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-3">
                <FormItem>
                  <FormLabel>Board Id</FormLabel>
                  <FormControl>
                    <Input disabled defaultValue={boardId} />
                  </FormControl>
                </FormItem>

                <FormField
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="off"
                          autoCorrect="off"
                          placeholder="At least 4 characters"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="symbol"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Select a symbol</FormLabel>
                        <FormControl>
                          <div className="grid place-items-center">
                            <div className="flex items-center gap-2">
                              {["x", "o"].map((s, index) => (
                                <Symbol
                                  key={index}
                                  symbol={s}
                                  {...field}
                                  unavailable={alreadySelectedSymbol}
                                />
                              ))}
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <Separator />

                <Button
                  type="submit"
                  loading={isJoining}
                  className="shadow-current-theme my-2 text-lg"
                >
                  Join Board
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </RenderDialog>
  );
}
