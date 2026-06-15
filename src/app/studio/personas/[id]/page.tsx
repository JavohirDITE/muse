"use client";

import { use } from "react";
import { PersonaEditor } from "@/components/studio/persona-editor";

export default function PersonaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PersonaEditor personaId={id} />;
}
