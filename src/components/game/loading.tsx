import { Loader } from "lucide-react";

import { RenderDialog } from "../render-dialog";

export function GameLoading() {
  return (
    <RenderDialog open hideCloseBtn>
      <div className="shadow-current-theme grid place-items-center py-5 px-5 rounded-lg select-none">
        <div className="flex flex-col justify-center items-center gap-3">
          <span className="flex items-end">
            <Loader size={40} className="border-current-theme animate-spin" />
            <span className="text-[12px]">loading...</span>
          </span>
          <h1 className="font-josefin-sans text-3xl">Tic-Tac-Toe</h1>
        </div>
      </div>
    </RenderDialog>
  );
}
