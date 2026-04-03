# External Dependencies Notes

During the renaming from Paperclip to Agilo, we updated all internal references, UI text, CLI commands, and npm package scopes. However, some external dependencies and integrations were kept as-is to ensure they remain functional until the external resources are officially renamed or migrated.

Here are the external dependencies that need to be manually updated in the future:

## 1. GitHub Repositories
- The default Agent Skills point to `https://github.com/paperclipai/paperclip`.
- Any image URLs pointing to `raw.githubusercontent.com/paperclipai/...`.
- **Action Required**: Once the GitHub organization and repository are renamed to `agilo/agilo` (or similar), these URLs must be updated in the codebase.

## 2. External Services & Webhooks
- Check any external webhooks, API keys, or third-party configurations that might be tied to the `paperclipai` name.
- **Action Required**: Update the configurations in the respective third-party dashboards (e.g., Stripe, AWS, Vercel, etc.) and then update the environment variables or hardcoded values in this repository.

## 3. NPM Packages
- While internal package scopes were renamed to `@agilo`, if any of these packages are published to the public npm registry, you will need to create the `@agilo` organization on npm and publish them there.
- **Action Required**: Register `@agilo` on npm and update the publishing scripts if necessary.

## 4. Emails
- Some scripts and skills reference `noreply@paperclip.ing`.
- **Action Required**: Once the `agilo.tech` domain is fully set up for email, update these email addresses to use `@agilo.tech`.

## 5. Documentation and Marketing
- The marketing site and documentation URLs have been updated to `https://agilo.tech`. Ensure that the actual hosting and DNS settings for `agilo.tech` are correctly configured to serve these resources.