import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useFinance } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const authed = useFinance((s) => s.authed);
  const onboarded = useFinance((s) => s.onboarded);

  useEffect(() => {
    if (!authed) navigate({ to: "/login" });
    else if (!onboarded) navigate({ to: "/onboarding" });
    else navigate({ to: "/dashboard" });
  }, [authed, onboarded, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-2 animate-pulse rounded-full bg-accent" />
    </div>
  );
}
