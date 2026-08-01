import { Button } from "@/components/ui/button";
import { EyeOff, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const steps = [
  {
    n: "01",
    t: "Create a room",
    d: "Paste a link to the content you want reviewed and give the room a name.",
  },
  {
    n: "02",
    t: "Share the review link",
    d: "Send it anywhere. Reviewers just open it — no sign-in, no account, no friction.",
  },
  {
    n: "03",
    t: "Collect honest answers",
    d: "Each visitor can submit once. Every review arrives without a name attached.",
  },
];

const reasons = [
  {
    icon: EyeOff,
    t: "People say more when no one's watching",
    d: "Drop the social pressure to soften feedback. Reviewers tell you what they'd never say with their name attached.",
  },
  {
    icon: CheckCircle2,
    t: "One review per person, every time",
    d: "A lightweight check stops duplicate submissions, so every room reflects distinct opinions, not repeat votes.",
  },
  {
    icon: Zap,
    t: "Nothing to set up before you start",
    d: "No reviewer accounts, no moderation queue, no settings. Create a room and share the link.",
  },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 font-medium">
            <span className="block h-2.5 w-5 rounded-sm bg-foreground" />
            <span className="font-mono text-base tracking-tight">
              ano<span className="text-primary">rev</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 md:py-28">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-wider text-primary">
                Reviewers never need an account
              </p>
              <h1 className="mb-5 text-4xl font-semibold tracking-tight md:text-5xl">
                Honest feedback.
                <br />
                <span className="text-primary">Hidden identities.</span>
              </h1>
              <p className="mb-8 max-w-md text-lg text-muted-foreground">
                Create a room for anything that needs feedback — a design, a draft,
                a pitch deck. Share one link. Anyone who opens it can leave exactly
                one anonymous review.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="/signin">Sign in</Link>
                </Button>
              </div>
            </div>

            <div className="ml-auto w-full max-w-sm rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded bg-muted px-2 py-1 font-mono text-xs uppercase text-muted-foreground">
                  Submitted anonymously
                </span>
              </div>
              <p className="mb-5 text-sm">
                &ldquo;The onboarding flow finally makes sense. Step 3 still
                tripped me up for a second, but overall this is ready to
                ship.&rdquo;
              </p>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="inline-block h-3.5 w-32 rounded bg-foreground" />
                <span className="font-mono text-xs text-muted-foreground">
                  identity hidden
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                <span>Design Review Room</span>
                <span>2 min ago</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="mb-10 text-2xl font-semibold tracking-tight">
              How a room works
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="border-t-2 border-foreground pt-4">
                  <span className="mb-2 block font-mono text-sm text-primary">
                    {step.n}
                  </span>
                  <h3 className="mb-2 font-semibold">{step.t}</h3>
                  <p className="text-sm text-muted-foreground">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="mb-10 text-2xl font-semibold tracking-tight">
              Why anonymous
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {reasons.map(({ icon: Icon, t, d }) => (
                <div key={t} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-semibold">{t}</h3>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="block h-2.5 w-5 rounded-sm bg-foreground" />
            <span>Built for honest feedback. © {new Date().getFullYear()} ano rev</span>
          </div>
        </div>
      </footer>
    </>
  );
}