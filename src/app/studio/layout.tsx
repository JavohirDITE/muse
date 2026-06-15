import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudioShell } from "@/components/studio/studio-shell";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <StudioShell
      user={{ id: session.userId, name: session.name, email: session.email }}
    >
      {children}
    </StudioShell>
  );
}
