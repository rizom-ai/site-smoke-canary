import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "preact-render-to-string";

import site, { CanaryHomeLayout, canaryMarker, canaryStatus } from "../src";

describe("smoke canary site package", () => {
  it("publishes the stable external authoring contract", async () => {
    const manifest = (await Bun.file(
      join(import.meta.dir, "..", "package.json"),
    ).json()) as Record<string, unknown>;
    const peers = manifest["peerDependencies"] as Record<string, unknown>;
    const dependencies = manifest["dependencies"] as Record<string, unknown>;
    expect(peers["@rizom/brain"]).toBe(">=0.2.0-alpha.272 <0.3.0");
    expect(dependencies["@rizom/site"]).toBe("0.2.0-alpha.233");
    expect(manifest["publishPeerDependencies"]).toBeUndefined();
    expect(manifest["publishExports"]).toBeUndefined();
    expect(JSON.stringify(manifest)).not.toContain("workspace:");

    const source = await Bun.file(
      join(import.meta.dir, "..", "src", "index.ts"),
    ).text();
    expect(source).toContain('from "@rizom/site"');
    expect(source).not.toContain("@rizom/brain/site");
    expect(source).not.toContain("ServicePlugin");
  });

  it("exports a minimal, content-independent site definition", () => {
    expect(site.layouts["default"]).toBeFunction();
    expect(site.sections).toBeArray();
    expect(site).not.toHaveProperty("plugin");
    // The canary owns no entity types — it must not depend on blog/decks/profile.
    expect(site.entityDisplay).toEqual({});
  });

  it("serves a single self-contained home route", () => {
    expect(site.routes).toHaveLength(1);
    const home = site.routes[0];
    expect(home?.path).toBe("/");
    const section = home?.sections?.[0];
    // The public authoring API normalizes the template and supplies validated
    // static package metadata without querying brain content.
    expect(section?.template).toBe("smoke-canary-site:home");
    expect(section?.content).toEqual(canaryStatus);
  });

  it("ships a deterministic public canary marker", () => {
    expect(site.staticAssets?.["/.well-known/rover-site-canary.json"]).toBe(
      canaryMarker,
    );
    expect(JSON.parse(canaryMarker)).toEqual({
      package: "@rizom/site-smoke-canary",
      purpose: "hosted-external-package-canary",
      surface: "smoke.rizom.ai",
    });
  });

  it("exposes the built package version for on-page verification", () => {
    expect(canaryStatus.package).toBe("@rizom/site-smoke-canary");
    expect(canaryStatus.surface).toBe("smoke.rizom.ai");
    expect(canaryStatus.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("renders deterministic homepage content (not an empty page)", () => {
    const html = renderToString(CanaryHomeLayout(canaryStatus));
    expect(html).toContain("@rizom/site-smoke-canary");
    expect(html).toContain(canaryStatus.version);
    expect(html.length).toBeGreaterThan(200);
  });

  // The package ships raw `src/*.tsx`, transpiled live by the brain runtime,
  // which defaults to the React JSX runtime. Each JSX file must self-declare the
  // preact runtime via pragma or boot fails resolving `react/jsx-runtime`.
  it("declares the preact JSX runtime pragma in every shipped .tsx", () => {
    const srcDir = join(import.meta.dir, "..", "src");
    const tsxFiles = readdirSync(srcDir, { recursive: true }).filter(
      (entry): entry is string =>
        typeof entry === "string" && entry.endsWith(".tsx"),
    );
    expect(tsxFiles.length).toBeGreaterThan(0);
    for (const relativePath of tsxFiles) {
      const source = readFileSync(join(srcDir, relativePath), "utf8");
      expect(source.startsWith("/** @jsxImportSource preact */")).toBe(true);
    }
  });
});
