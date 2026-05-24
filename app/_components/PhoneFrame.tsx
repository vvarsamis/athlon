import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function PhoneFrame({ children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center p-0 sm:p-5">
      <div className="relative w-full overflow-hidden bg-[#0A0A0A] sm:max-w-[420px] sm:min-h-[880px] sm:rounded-[44px] sm:border sm:border-border sm:shadow-[0_40px_100px_rgba(0,0,0,0.6)] min-h-screen">
        <div className="absolute left-1/2 top-3.5 z-10 hidden h-7 w-[110px] -translate-x-1/2 rounded-full bg-black sm:block" />
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[150px] h-[380px] w-[380px] rounded-full opacity-55 blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, rgba(197,255,0,0.4) 0%, transparent 65%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-[120px] -right-[100px] h-[280px] w-[280px] rounded-full blur-[70px]"
          style={{
            background:
              "radial-gradient(circle, rgba(197,255,0,0.2) 0%, transparent 70%)",
          }}
        />
        {children}
        <div className="absolute bottom-2 left-1/2 hidden h-[5px] w-[134px] -translate-x-1/2 rounded-[3px] bg-text-1/40 sm:block" />
      </div>
    </div>
  );
}
