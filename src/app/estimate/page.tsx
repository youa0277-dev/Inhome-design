import type { Metadata } from "next";
import { EstimatorShell } from "@/components/estimate/EstimatorShell";

export const metadata: Metadata = {
  title: "Damage Estimate — car repair cost from photos",
  description:
    "Upload photos of your car's damage and get a repair cost range adjusted for your location, including potential hidden damage.",
};

export default function EstimatePage() {
  return <EstimatorShell />;
}
