# Jialu Xu

Personal research and projects website. The public site contains the current
About page, three selected publications, HornSuite, Coécho, and The Pack.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Deployment

The primary site is [jialu-xu.pages.dev](https://jialu-xu.pages.dev/), a
Cloudflare Pages Direct Upload project with no Git provider. To publish a local
change, use an authenticated Cloudflare Wrangler session:

```sh
pnpm build
npx --yes wrangler@latest pages deploy dist --project-name=jialu-xu --branch=main
```

No GitHub push is required. The existing GitHub Pages workflow still publishes
the older GitHub-hosted URL when `main` is pushed there. The site uses hash
routes `#/` and `#/projects` on both hosts.

## Attribution

The navigation adapts the WebGL shader and renderer from
[Liquid Glass Studio](https://github.com/iyinchao/liquid-glass-studio).
Its MIT license is retained in [LICENSE](LICENSE). Site text and media are
specific to Jialu Xu. The University of Waterloo logo is the unmodified
horizontal colour version from the university's [official logo kit](https://uwaterloo.ca/brand/uw-logos/university-logos/all).
