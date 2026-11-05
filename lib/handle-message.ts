import type { Message, Space } from "spectrum-ts";
import { isDuplicateMessage } from "@/lib/dedupe";
import { generatePennyReply } from "@/lib/penny";

function inboundText(message: Message): string | null {
  if (message.direction === "outbound") {
    return null;
  }
  if (message.sender?.kind === "agent") {
    return null;
  }
  if (message.content.type !== "text") {
    return null;
  }
  const text = message.content.text.trim();
  return text.length > 0 ? text : null;
}

export async function handlePennyMessage(
  space: Space,
  message: Message,
): Promise<void> {
  if (isDuplicateMessage(message.id)) {
    return;
  }

  const text = inboundText(message);
  if (!text) {
    return;
  }

  try {
    await space.responding(async () => {
      const reply = await generatePennyReply(text);
      await message.reply(reply);
    });
  } catch (error) {
    console.error("Penny failed to reply", error);
    try {
      await space.send(
        "Something went sideways on my side. Mind sending that again in a moment?",
      );
    } catch (sendError) {
      console.error("Penny failed to send fallback", sendError);
    }
  }
}
