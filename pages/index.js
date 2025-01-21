import Link from "next/link";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";

export default function Home() {
  const slug = process.env.ASSISTANT_ID;

  return (
    <div className="flex flex-col bg-page min-h-[100dvh] font-proximanova-regular">
      <nav className="px-4 py-2 min-h-14 border-b flex items-center border-border-color">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <Link href="/" className="text-lg font-medium text-accent">
            Assistant Name
          </Link>

          <ThemeToggleButton />
        </div>
      </nav>

      <section className="px-4 py-10 sm:py-24">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto space-y-8">
            <h1 className="text-2xl leading-9 xsm:text-3xl text-accent xsm:leading-10 sm:text-4xl sm:leading-[54px] md:text-5xl md:leading-[68px] font-semibold text-center">
              Hi! I'm Your{" "}
              <span className="text-secondary">Smart Assistant</span>
            </h1>

            <p className="max-w-3xl mx-auto text-base font-normal leading-7 text-center text-accent sm:leading-8 sm:text-lg">
              I can help you with tasks, answer your questions, and simplify
              your day. Let’s get started!
            </p>

            <div className="flex items-center justify-center w-full">
              <Link
                className="px-3 py-2 text-sm font-medium tracking-wider rounded-lg sm:px-4 sm:py-3 text-accent-foreground bg-secondary hover:bg-secondary-foreground"
                href={`/6763f6d904cfc3b87d8794cf`}
              >
                Chat now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
