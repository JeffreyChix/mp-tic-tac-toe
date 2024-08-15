"use client";

import { useEffect } from "react";

import { useSound } from "@/hooks/useSound";

export function InitSounds() {
  const { playSound } = useSound();

  useEffect(() => {
    playSound("bg-music");
  }, [playSound]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      let target = event.target as HTMLElement;

      while (target && target !== document.body) {
        if (target.tagName === "BUTTON") {
          playSound("click");

          target.classList.add("click-animation");
          setTimeout(() => {
            target.classList.remove("click-animation");
          }, 200);
          break;
        }
        target = target.parentElement as HTMLElement;
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [playSound]);

  return null;
}
