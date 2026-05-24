type Props = {
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-[44px]",
};

export function AthlonLogo({ size = "lg", tagline = true }: Props) {
  return (
    <div className="text-center">
      <div
        className={`${sizes[size]} font-black tracking-[-0.05em] leading-none`}
      >
        ATHLON
        <span
          className="text-accent"
          style={{ textShadow: "0 0 24px rgba(197, 255, 0, 0.7)" }}
        >
          .
        </span>
      </div>
      {tagline && (
        <div className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-text-3">
          Train · Track · Transform
        </div>
      )}
    </div>
  );
}
