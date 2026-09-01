import { describe, expect, test } from "bun:test";

async function runCli(args: string[]) {
  const child = Bun.spawn(
    [process.execPath, "run", "source/cli.tsx", ...args],
    {
      cwd: `${import.meta.dir}/..`,
      stderr: "pipe",
      stdout: "pipe",
    },
  );
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);

  return { exitCode, stdout, stderr };
}

describe("cli metadata", () => {
  test("prints help", async () => {
    const result = await runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage");
    expect(result.stdout).toContain("$ dollarpe --sort=buy");
  });

  test("prints the package version", async () => {
    const result = await runCli(["--version"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout.trim()).toBe("4.0.0");
  });
});
