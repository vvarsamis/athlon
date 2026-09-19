import type { ReactNode } from "react";
import { requireRole } from "../../lib/require-role";

export default async function WorkoutBuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("trainer");
  return <>{children}</>;
}
