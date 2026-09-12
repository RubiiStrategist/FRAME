import vinext from "vinext";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { sites } from "./build/sites-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

const isCodexSeatbeltSandbox =
  process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig({
  server: isCodexSeatbeltSandbox
    ? { watch: { useFsEvents: false, usePolling: true } }
    : undefined,

  plugins: [
    vinext(),
    tailwindcss(),
    sites(),
    nitro(),
  ],
});
