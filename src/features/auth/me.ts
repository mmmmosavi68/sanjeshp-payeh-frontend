import { z } from "zod";
import { apiRequest } from "@/lib/api/client";

const meSchema = z.object({
  id: z.string(),
  userName: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  roles: z.array(z.object({ id: z.number(), nameEn: z.string(), nameFa: z.string() })),
});

export type Me = z.infer<typeof meSchema>;

// هدر و سایدبار هر دو پروفایل را می‌خواهند؛ درخواست‌های هم‌زمان یک بار ارسال می‌شود.
let inflight: { at: number; promise: Promise<Me> } | null = null;

export function getMe(): Promise<Me> {
  if (inflight && Date.now() - inflight.at < 3000) return inflight.promise;
  const promise = apiRequest("auth/me", { schema: meSchema }) as Promise<Me>;
  inflight = { at: Date.now(), promise };
  promise.catch(() => {
    if (inflight?.promise === promise) inflight = null;
  });
  return promise;
}
