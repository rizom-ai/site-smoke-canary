import { defineSection, defineSite, sectionGroup, z } from "@rizom/site";
import { CanaryLayout } from "./layouts/CanaryLayout";
import { CanaryHomeLayout, type CanaryHomeData } from "./templates/canary-home";
import { routes } from "./routes";
import { canaryMarker, canaryStatus, type CanaryStatus } from "./canary";

export {
  CanaryLayout,
  CanaryHomeLayout,
  type CanaryHomeData,
  routes,
  canaryMarker,
  canaryStatus,
  type CanaryStatus,
};

const home = defineSection(
  z.object({
    package: z.string(),
    purpose: z.string(),
    surface: z.string(),
    version: z.string(),
  }),
  CanaryHomeLayout,
  {
    title: "Smoke canary home",
    description: "Deterministic hosted-package compatibility marker.",
    requiredPermission: "public",
  },
);

/**
 * Minimal, content-independent canary site. Owns no entity types and depends
 * on no brain content — its single route renders static package metadata that
 * proves the externally hosted site and theme loaded, built, and deployed.
 */
export default defineSite({
  layouts: {
    default: CanaryLayout,
  },
  routes,
  sections: [sectionGroup("smoke-canary-site", { home })],
  content: {
    "smoke-canary-site": {
      home: {
        package: canaryStatus.package,
        purpose: canaryStatus.purpose,
        surface: canaryStatus.surface,
        version: canaryStatus.version,
      },
    },
  },
  entityDisplay: {},
  staticAssets: {
    "/.well-known/rover-site-canary.json": canaryMarker,
  },
});
