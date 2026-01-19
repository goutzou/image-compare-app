"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ScoresAuthGate() {
  const router = useRouter();

  useEffect(() => {
    const role = window.localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
