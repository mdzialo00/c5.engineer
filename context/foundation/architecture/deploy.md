# Push to live URL

A `git push` to `main` runs the local pre-push hook, then triggers the GitHub Actions workflow. The workflow builds with the OpenNext adapter, deploys to Cloudflare Workers and checks the live URL. Crosses the pre-push hook, GitHub Actions and the Cloudflare Worker.

```mermaid
sequenceDiagram
  Developer->>Husky: git push
  Husky->>Husky: yarn lint && yarn build
  Husky->>GitHub: push to main
  GitHub->>Actions: trigger deploy.yml
  Actions->>Actions: yarn install, lint, opennextjs-cloudflare build
  Actions->>Cloudflare: wrangler deploy (.open-next)
  Cloudflare-->>Actions: deployment-url
  Actions->>Cloudflare: curl smoke test (retries)
  Cloudflare-->>Actions: 200
```
