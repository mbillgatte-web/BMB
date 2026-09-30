import Link from "next/link";
import { cn } from "@/lib/cn";

/** Nom de la plateforme, avec son monogramme. */
export default function BrandMark({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 rounded-md text-on-surface", className)}
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-on-primary"
      >
        B
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">Build My Business</span>
    </Link>
  );
}
