const PLACEHOLDER_NUMBER = "+15555550100";
const DEFAULT_GREETING = "Hey Penny";

export function getIMessageNumber(): string {
  const value = process.env.NEXT_PUBLIC_IMESSAGE_NUMBER?.trim();
  return value && value.length > 0 ? value : PLACEHOLDER_NUMBER;
}

export function imessageSmsHref(
  phone = getIMessageNumber(),
  body = DEFAULT_GREETING,
): string {
  const dest = phone.replace(/[^\d+]/g, "");
  return `sms:${dest}&body=${encodeURIComponent(body)}`;
}
