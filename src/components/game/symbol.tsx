import { forwardRef } from "react";
import clsx from "clsx";

export const Symbol = forwardRef<
  HTMLButtonElement,
  {
    symbol: string;
    value: string;
    onChange: (symbol: string) => void;
    unavailable?: string;
  }
>(({ symbol, unavailable, onChange, value, ...otherProps }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(
        "border-current-theme border-2 rounded-lg w-12 h-12 grid place-items-center text-4xl font-josefin-sans hover:bg-current-theme disabled:opacity-65 disabled:cursor-not-allowed",
        value === symbol && "bg-current-theme"
      )}
      disabled={symbol === unavailable}
      onClick={() => {
        onChange(symbol);
      }}
      {...otherProps}
    >
      {symbol}
    </button>
  );
});

Symbol.displayName = "Symbol";
