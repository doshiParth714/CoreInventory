import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function generateReference(
    type: "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT",
    sequence: number
): string {
    const year = new Date().getFullYear();
    const padded = String(sequence).padStart(4, "0");
    const prefixMap = {
        RECEIPT: "REC",
        DELIVERY: "DEL",
        TRANSFER: "INT",
        ADJUSTMENT: "ADJ",
    };
    const prefix = prefixMap[type];
    return `${prefix}/${year}/Operation/${padded}`;
}

export function freeToUse(onHand: number, reserved: number): number {
    return Math.max(0, onHand - reserved);
}
