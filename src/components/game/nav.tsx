import { Gamepad2 as GameSettingsIcon } from "lucide-react";

import { ScoreBoard } from "./score-board";
import { RenderSheet } from "../render-sheet";
import { Settings } from "./settings";
import { RenderDialog } from "../render-dialog";
import { CreateNewBoard } from "./forms/create-new-board";

export function Nav() {
  return (
    <>
      <nav className="w-full px-4 py-2 fixed top-0 left-0 bg-background">
        <div className="flex items-center justify-between">
          <RenderSheet
            trigger={
              <span className="grid place-items-center rounded-[50%] shadow-current-theme p-1 select-none">
                <GameSettingsIcon
                  size={30}
                  className="flip-animation repeat-infinite"
                />
                <span className="sr-only">Toogle Settings</span>
              </span>
            }
          >
            <Settings />
          </RenderSheet>
          <ScoreBoard />
          {/* <button type="button" className="hidden md:block">
            Connect Wallet
          </button> */}
          <RenderDialog
            trigger={<span className="hidden md:block">Create Board</span>}
          >
            <CreateNewBoard />
          </RenderDialog>
        </div>
      </nav>
    </>
  );
}
