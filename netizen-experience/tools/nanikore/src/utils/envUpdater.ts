import * as fs from "fs";
import * as os from "os";

export function updateEnvFile(envPath: string, env: Record<string, string>): void {
  const writeEnvFile = (filePath: string, env: Record<string, string>): void => {
    const lines: string[] = [];
    for (const key in env) {
      const value = env[key];
      const line = `${key}=${value}`;
      lines.push(line);
    }
    fs.writeFileSync(filePath, lines.join(os.EOL));
  };
  writeEnvFile(envPath, env);
  console.log(`Wrote to ${envPath}`);
}
