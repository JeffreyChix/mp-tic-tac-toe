"use client";

import { useRouter } from "next/navigation";

import { RenderDialog } from "../render-dialog";
import { Button } from "../ui/button";

export function RogueBoard() {
  const router = useRouter();

  return (
    <RenderDialog open hideCloseBtn>
      <div className="grid place-items-center gap-3">
        <p>Sorry, this is a rogue board!</p>
        <Button onClick={() => router.push("/")}>Close</Button>
      </div>
    </RenderDialog>
  );
}
