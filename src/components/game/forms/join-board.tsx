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
import { BoardState } from "../../../../type";
import { RogueBoard } from "../rogue-board";
import { useGameSession } from "@/hooks/useGameSession";
import { ActionTypes } from "@/contexts/game-session/reducer";
import { organizeBoardForSession } from "@/lib/game/utils";
import { Info } from "lucide-react";

export function JoinBoardForm({ boardId }: { boardId: string }) {
  const { dispatch } = useGameSession();

  const { socket } = useSocket();

  const [isGameLoading, setIsGameLoading] = useState(true);
  const [isRogue, setIsRogue] = useState(false);
  const [boardInfo, setBoardInfo] = useState({
    name: "Join Board",
    symbol: "",
  });
  const [isError, setIsError] = useState(false);

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

      setBoardInfo({
        name: `${res.board.player.username}'s Board`,
        symbol: res.board.player.symbol,
      });
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
      (res: { status: string; board: BoardState }) => {
        if (res.status === "OK") {
          dispatch({
            type: ActionTypes.SET_BOARD,
            payload: organizeBoardForSession(socket.sessionID, res.board),
          });
          router.push(`/board/${boardId}`);
        } else {
          setIsError(true);
        }
      }
    );
  };

  if (isGameLoading) return <GameLoading />;

  if (!isGameLoading && isRogue) return <RogueBoard />;

  if (isError) {
    return (
      <RenderDialog open hideCloseBtn>
        <div className="grid place-items-center gap-3 p-4">
          <Info size={35} className="text-red-600" />

          <p className="font-josefin-sans text-center">
            Sorry! You cannot join this board right now. It appears to be full.
          </p>

          <Button onClick={() => router.push("/")}>Okay</Button>
        </div>
      </RenderDialog>
    );
  }

  return (
    <RenderDialog open hideCloseBtn>
      <div>
        <p className="capitalize">{boardInfo.name}</p>

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
                                  unavailable={boardInfo.symbol}
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
