import type { ReactNode } from "react";

interface ToolPageProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

export function ToolPage({ title, description, icon, children }: ToolPageProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
