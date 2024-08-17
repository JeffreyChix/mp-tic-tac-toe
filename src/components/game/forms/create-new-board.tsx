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
import { Symbol } from "../symbol";
import { NEW_BOARD_SCHEMA } from "../../../../schema";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSocket } from "@/hooks/useSocket";
import { CREATE_BOARD } from "@/lib/socket/utils";
import { useGameSession } from "@/hooks/useGameSession";
import { ActionTypes } from "@/contexts/game-session/reducer";
import { BoardState } from "../../../../type";

export function CreateNewBoard() {
  const { dispatch } = useGameSession();

  const form = useForm({
    resolver: zodResolver(NEW_BOARD_SCHEMA),
    mode: "onSubmit",
  });

  const [isCreating, setIsCreating] = useState(false);
  const { socket } = useSocket();

  const router = useRouter();

  const onSubmit = async (values: any) => {
    setIsCreating(true);
    socket.emit(
      CREATE_BOARD,
      values,
      (res: { status: "OK"; board: BoardState }) => {
        if (res.status === "OK") {
          dispatch({ type: ActionTypes.SET_BOARD, payload: res.board });

          toast.success("Board created! Please wait...", { duration: 5000 });
          router.push(`/board/${res.board.boardId}/?name=${values.username}`);
        }
      }
    );
  };

  return (
    <div>
      <p>Create Board</p>

      <div className="my-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-3">
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
                              <Symbol key={index} symbol={s} {...field} />
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
                loading={isCreating}
                className="shadow-current-theme my-2 text-lg"
              >
                Create Board
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
