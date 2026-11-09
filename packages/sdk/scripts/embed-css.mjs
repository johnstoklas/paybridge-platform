import { readFileSync, writeFileSync } from "node:fs";

const input = new URL("../src/react/styles/paybridge-compiled.css", import.meta.url);
const output = new URL("../src/react/styles/paybridge-styles.ts", import.meta.url);

const css = readFileSync(input, "utf8");

writeFileSync(
  output,
  `export const paybridgeStyles = ${JSON.stringify(css)};\n`
);

console.log("PayBridge CSS embedded successfully!");