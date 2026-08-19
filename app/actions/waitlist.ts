"use server";

import { getSql } from "@/lib/db";

export type WaitlistState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ensureWaitlistTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function joinWaitlist(
  _prevState: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const rawEmail = formData.get("email");
  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!EMAIL_PATTERN.test(email)) {
    return {
      status: "error",
      message: "please enter a valid email address.",
    };
  }

  try {
    await ensureWaitlistTable();
    const sql = getSql();
    const rows = await sql`
      INSERT INTO waitlist (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;

    if (rows.length === 0) {
      return {
        status: "success",
        message: "you're already on the list. we'll be in touch.",
      };
    }

    return {
      status: "success",
      message: "you're on the list. we'll let you know when we launch.",
    };
  } catch (error) {
    console.error("Failed to join waitlist:", error);
    return {
      status: "error",
      message: "something went wrong. please try again in a moment.",
    };
  }
}
