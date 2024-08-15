"use client";

import { useEffect, useMemo } from "react";
import { Howl, Howler, HowlOptions } from "howler";

import type { SoundKeys } from "../../type";
import { useGameSession } from "./useGameSession";

// Sound Effects from <a href="https://pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=96492">Pixabay</a>

interface SoundManager {
  addSound: (key: SoundKeys, opts: HowlOptions) => void;
  playSound: (key: SoundKeys) => void;
  stopSound: (key: SoundKeys) => void;
  clearSounds: () => void;
}

export function useSound(): SoundManager {
  const { session } = useGameSession();

  const isSoundOn = useMemo(
    () => session.settings.sound === true,
    [session.settings.sound]
  );

  const soundManager = useMemo(() => {
    const sounds: Record<SoundKeys, Howl> = {
      "new-game": new Howl({ src: require("../../public/audio/new-game.mp3") }),
      "player-move": new Howl({
        src: require("../../public/audio/player-move.mp3"),
      }),
      "opponent-move": new Howl({
        src: require("../../public/audio/computer-move.mp3"),
      }),
      "bg-music": new Howl({
        src: require("../../public/audio/bg-music.mp3"),
        volume: 0.1,
        loop: true,
      }),
      "game-over": new Howl({
        src: require("../../public/audio/game-over.mp3"),
      }),
      won: new Howl({
        src: require("../../public/audio/won-2.mp3"),
      }),
      click: new Howl({
        src: require("../../public/audio/click.mp3"),
      }),
      error: new Howl({
        src: require("../../public/audio/error.mp3"),
      }),
    };

    const addSound = (key: SoundKeys, opts: HowlOptions) => {
      if (!sounds[key] && isSoundOn) {
        sounds[key] = new Howl({ ...opts, src: opts.src || "" });
      }
    };

    const playSound = (key: SoundKeys) => {
      if (isSoundOn && sounds[key]) {
        if (sounds[key].playing()) {
          sounds[key].stop();
        }
        sounds[key].play();
      }
    };

    const stopSound = (key: SoundKeys) => {
      if (sounds[key]) {
        sounds[key].stop();
      }
    };

    const clearSounds = () => {
      Object.values(sounds).forEach((sound) => sound.stop());
    };

    return { addSound, playSound, stopSound, clearSounds };
  }, [isSoundOn]);

  useEffect(() => {
    if (!isSoundOn) {
      Howler.stop();
    }
  }, [isSoundOn]);

  return soundManager;
}
