import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges class names via `clsx` then deduplicates Tailwind utilities via `twMerge`. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}