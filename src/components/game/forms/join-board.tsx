"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import { useGameSession } from "@/hooks/useGameSession";
import { ActionTypes } from "@/contexts/game-session/reducer";
import { JOIN_BOARD, JOINED_BOARD, VERIFY_BOARD } from "@/lib/socket/utils";
import { Player } from "../../../../type";
import { GameLoading } from "../loading";
import { RenderDialog } from "@/components/render-dialog";

export function JoinBoardForm({ boardId }: { boardId: string }) {
  const { socket } = useSocket();
  const { dispatch } = useGameSession();

  const [boardName, setBoardName] = useState("Join Board");
  const [gameLoading, setGameLoading] = useState(true);
  const [isRogue, setIsRogue] = useState(false);
  const [alreadySelectedSymbol, setAlreadySelectedSymbol] = useState("");

  const router = useRouter();

  useEffect(() => {
    socket.emit(
      VERIFY_BOARD,
      boardId,
      (res: {
        exists: boolean;
        playerUsername: string;
        playerSymbol: string;
      }) => {
        setTimeout(() => {
          setGameLoading(false);
        }, 1000);

        if (!res.exists) {
          setIsRogue(true);
          return;
        }
        setBoardName(`${res.playerUsername}'s Board`);
        setAlreadySelectedSymbol(res.playerSymbol);
      }
    );
  }, [boardId, socket]);

  useEffect(() => {
    const joinedBoardHandler = (opponent: Player) => {
      dispatch({
        type: ActionTypes.INIT_PLAYER,
        payload: { key: "opponent", player: opponent },
      });

      router.push(`/board/${boardId}`);
      toast.success("You're joined!");
    };

    socket.on(JOINED_BOARD, joinedBoardHandler);

    return () => {
      socket.off(JOINED_BOARD, joinedBoardHandler);
    };
  }, [boardId, dispatch, router, socket]);

  const form = useForm({
    resolver: zodResolver(NEW_BOARD_SCHEMA),
    mode: "onSubmit",
  });

  const [isJoining, setIsJoining] = useState(false);

  const onSubmit = async (values: any) => {
    setIsJoining(true);

    const player: Player = { ...values, id: socket.sessionID, type: "joined" };

    dispatch({
      type: ActionTypes.INIT_PLAYER,
      payload: { key: "player", player },
    });

    socket.emit(JOIN_BOARD, boardId, player, (res: { status: "OK" }) => {
      if (res.status !== "OK") {
        // throw error
      }
    });
  };

  if (gameLoading) return <GameLoading />;

  if (!gameLoading && isRogue) {
    return (
      <RenderDialog open hideCloseBtn>
        <div className="grid place-items-center gap-3">
          <p>Sorry, this is a rogue board!</p>
          <Button onClick={() => router.push("/")}>Close</Button>
        </div>
      </RenderDialog>
    );
  }

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
