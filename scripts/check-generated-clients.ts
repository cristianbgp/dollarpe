import { resolve } from "node:path";
import { generateClients, generatedClientPaths } from "./generate-clients";

const rootDirectory = resolve(import.meta.dir, "..");

async function readGeneratedClients(): Promise<Map<string, string | null>> {
  const entries = await Promise.all(
    generatedClientPaths.map(async (path) => {
      const file = Bun.file(resolve(rootDirectory, path));
      return [path, (await file.exists()) ? await file.text() : null] as const;
    }),
  );

  return new Map(entries);
}

export async function checkGeneratedClients(): Promise<string[]> {
  const before = await readGeneratedClients();
  await generateClients();
  const after = await readGeneratedClients();

  return generatedClientPaths.filter(
    (path) => before.get(path) !== after.get(path),
  );
}

if (import.meta.main) {
  const changedPaths = await checkGeneratedClients();

  if (changedPaths.length > 0) {
    throw new Error(
      `Generated API clients are stale:\n${changedPaths.join("\n")}\nRun bun run client:generate and include the results.`,
    );
  }
}
