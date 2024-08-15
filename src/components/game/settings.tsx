import { useTheme } from "next-themes";
import { CircleCheck, VolumeX, Volume2 } from "lucide-react";
import clsx from "clsx";

import { Separator } from "../ui/separator";
import { THEMES_WITH_DISPLAY_NAMES } from "@/lib/game/utils";
import { useGameSession } from "@/hooks/useGameSession";
import { ActionTypes } from "@/contexts/game-session/reducer";

export function Settings() {
  return (
    <div className="flex flex-col gap-4 overflow-auto py-8 px-4">
      <ThemeSettings />
      <Separator />
      <ToggleSound />
    </div>
  );
}

const ThemeSettings = () => {
  const { setTheme, theme } = useTheme();

  return (
    <div>
      <p>Choose a theme</p>

      <div className="grid grid-cols-3 gap-3 items-start justify-center my-5">
        {THEMES_WITH_DISPLAY_NAMES.map(({ name, value }, index) => (
          <button
            className={clsx("relative grid place-items-center gap-1", value)}
            key={index + value}
            onClick={() => setTheme(value)}
          >
            {theme === value && (
              <CircleCheck
                fill="white"
                className="h-5 w-5 absolute top-0 right-0 text-green-600"
              />
            )}
            <div
              className={clsx(
                "w-20 h-10 rounded-lg border-2",
                value !== "lightsOff" && "bg-current-theme"
              )}
            />
            <span className="text-xs">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ToggleSound = () => {
  const {
    session: { settings },
    dispatch,
  } = useGameSession();

  const isSoundOn = settings.sound;

  return (
    <div>
      <p>Toggle sound</p>

      <button
        onClick={() =>
          dispatch({
            type: ActionTypes.SAVE_SETTINGS,
            payload: { ...settings, sound: !isSoundOn },
          })
        }
        type="button"
        className="flex items-center gap-2 my-5 outline-none outline-0 border-none"
      >
        {isSoundOn ? <VolumeX /> : <Volume2 />}
        <span>{isSoundOn ? "Turn Off" : "Turn On"}</span>
      </button>
    </div>
  );
};
