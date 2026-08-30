import type { JSX } from "react";
import type { CanaryStatus } from "../canary";

/** Static build metadata validated by the public site authoring contract. */
export type CanaryHomeData = CanaryStatus;

/**
 * Deterministic canary homepage. Renders fixed build metadata with theme
 * tokens so a successful render proves the externally-hosted site+theme
 * package loaded, built, deployed, and styled — with no dependency on brain
 * content (profile, posts, site-info).
 */
export const CanaryHomeLayout = (data: CanaryHomeData): JSX.Element => {
  const rows: ReadonlyArray<[label: string, value: string]> = [
    ["Package", data.package],
    ["Version", data.version],
    ["Surface", data.surface],
    ["Purpose", data.purpose],
  ];

  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16 bg-theme">
      <p className="text-sm uppercase tracking-wide text-theme-muted mb-2">
        Rover site canary
      </p>
      <h1 className="text-3xl font-semibold text-heading mb-4">
        Package canary is live
      </h1>
      <p className="text-lg text-theme-muted mb-10">
        This page is served entirely by the externally-hosted{" "}
        <span className="text-theme">{data.package}</span> package. If you can
        read it, the package loaded, built, deployed, and rendered with its
        theme.
      </p>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-theme-muted">{label}</dt>
            <dd className="text-heading font-mono break-all">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
