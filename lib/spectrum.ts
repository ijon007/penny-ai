import { Spectrum } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";

type SpectrumApp = Awaited<ReturnType<typeof Spectrum>>;

const globalForSpectrum = globalThis as typeof globalThis & {
  pennySpectrum?: Promise<SpectrumApp>;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSpectrumApp(): Promise<SpectrumApp> {
  if (!globalForSpectrum.pennySpectrum) {
    globalForSpectrum.pennySpectrum = Spectrum({
      projectId: requiredEnv("SPECTRUM_PROJECT_ID"),
      projectSecret: requiredEnv("SPECTRUM_PROJECT_SECRET"),
      providers: [imessage.config()],
      webhookSecret: requiredEnv("SPECTRUM_WEBHOOK_SECRET"),
    });
  }
  return globalForSpectrum.pennySpectrum;
}
