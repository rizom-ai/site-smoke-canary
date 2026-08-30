import { describe, expect, it } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { join } from "node:path";

import site, {
  CanaryHomeLayout,
  CanaryLayout,
  canaryMarker,
  canaryStatus,
} from "../src";

describe("smoke canary site package", () => {
  it("publishes the stable external authoring contract", async () => {
    const manifest = (await Bun.file(
      join(import.meta.dir, "..", "package.json"),
    ).json()) as Record<string, unknown>;
    const peers = manifest["peerDependencies"] as Record<string, unknown>;
    const dependencies = manifest["dependencies"] as Record<string, unknown>;
    expect(peers["@rizom/brain"]).toBe(">=0.2.0-alpha.333 <0.3.0");
    expect(peers["react"]).toBe("^19.2.7");
    expect(peers["react-dom"]).toBe("^19.2.7");
    expect(dependencies["@rizom/site"]).toBe("0.2.0-alpha.235");
    expect(JSON.stringify(manifest)).not.toContain("preact");
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

  it("renders the complete package through React DOM without foreign VNodes", () => {
    const home = createElement(CanaryHomeLayout, {
      ...canaryStatus,
      key: "home",
    });
    const html = renderToStaticMarkup(
      createElement(CanaryLayout, { sections: [home] }),
    );

    expect(html).toContain("@rizom/site-smoke-canary");
    expect(html).toContain(canaryStatus.version);
    expect(html).toContain("Package canary is live");
    expect(html.length).toBeGreaterThan(200);
  });

  it("contains no retired Preact runtime imports or JSX directives", async () => {
    const sourceFiles = [
      join(import.meta.dir, "..", "src", "layouts", "CanaryLayout.tsx"),
      join(import.meta.dir, "..", "src", "templates", "canary-home.tsx"),
    ];
    for (const path of sourceFiles) {
      const source = await Bun.file(path).text();
      expect(source).not.toContain("preact");
      expect(source).not.toContain("@jsxImportSource");
    }
  });
});
