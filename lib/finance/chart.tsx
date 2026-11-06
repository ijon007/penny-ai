import { ImageResponse } from "next/og";

export async function renderSpendChartPng(
  bars: { label: string; minor: number }[],
  title = "Spending (MOCK DATA)",
): Promise<Buffer> {
  const max = Math.max(1, ...bars.map((b) => b.minor));
  const element = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        color: "#111",
        padding: 32,
        fontSize: 28,
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 22, color: "#666", marginBottom: 24 }}>
        Not linked to a real bank
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {bars.slice(0, 8).map((b) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 140 }}>{b.label}</div>
            <div
              style={{
                height: 28,
                width: `${Math.round((b.minor / max) * 480)}px`,
                background: "#007AFF",
                borderRadius: 6,
              }}
            />
            <div>${(b.minor / 100).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const res = new ImageResponse(element, { width: 900, height: 560 });
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
