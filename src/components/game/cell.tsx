import clsx from "clsx";

export function Cell({
  position,
  onClick,
  symbol,
  className,
}: {
  position: string;
  onClick: () => void;
  className?: string;
  symbol: any;
}) {
  return (
    <div
      className={clsx("cell", className, position)}
      tabIndex={0}
      onClick={onClick}
    >
      <div
        className={typeof symbol === "string" ? symbol.toLowerCase() : ""}
      />
    </div>
  );
}
