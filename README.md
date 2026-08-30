# @rizom/site-smoke-canary

The standalone reference package for externally authored Rizom sites. It is
published from this repository with plain `npm publish`, standard
`peerDependencies`, and no private `@brains/*` tooling.

The package is deliberately content-independent: one `/` route renders fixed
package metadata and exposes `/.well-known/rover-site-canary.json`. A successful
Smoke deployment proves that an ordinary npm site package loaded, built,
deployed, and rendered through the public hosting path.

## Public contract

The source uses the stable declarative site-authoring API from
`@rizom/site`; it does not import Brain internals or subclass runtime plugins.
The authoring API is an exact dependency, while Brain compatibility is
hand-authored in `peerDependencies` as `>=0.2.0-alpha.333 <0.3.0`. React and
React DOM are explicit peer dependencies, matching the Brain site renderer.
There is no publish-time manifest transform.

## Develop

```bash
bun install --frozen-lockfile
bun run check
npm pack --dry-run
```

## Release

Update `version`, run the checks, and dispatch the Publish workflow (or push a
matching `v*` tag). The workflow executes `npm publish --access public`
directly. The repository's npm trusted-publisher configuration must authorize
`rizom-ai/site-smoke-canary` and `.github/workflows/publish.yml`.
