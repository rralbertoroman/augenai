import { LoginForm } from "@/modules/auth/components";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full relative overflow-hidden">
      {/* Left side - Form */}
      <div className="flex w-full items-center justify-baseline ml-[5vw] p-6 md:p-10 lg:w-1/2 relative z-10">
        <div className="w-full max-w-lg">
          <LoginForm />
        </div>
      </div>

      {/* Diagonal separator */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 bottom-0 w-full bg-black/90 dark:bg-foreground border-l-10 border-primary/10 animate-[skew-in_1000ms_ease-out_forwards]"
          style={{
            left: "55%",
            transformOrigin: "top left",
            transform: "skewX(0deg)",
            color: "white",
          }}
        />
      </div>

      {/* Right side - Logo */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-10 relative z-10">
        <div className="relative w-full max-w-full">
          <Image
            src="/augen 2.svg"
            alt="AugenAI Logo"
            width={1600}
            height={1600}
            className="w-full h-auto pr-10 hover:scale-110 transition-all duration-500 dark:filter-[brightness(0)_saturate(100%)_invert(47%)_sepia(77%)_saturate(954%)_hue-rotate(117deg)_brightness(95%)_contrast(86%)] filter-none"
            priority
          />
        </div>
      </div>
    </div>
  );
}
