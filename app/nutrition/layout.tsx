import type { ReactNode } from "react";
import { requireRole } from "../../lib/require-role";

export default async function NutritionLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("trainer");
  return <>{children}</>;
}
