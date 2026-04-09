# AI Agent Global Rules - Trackio Application

## CRITICAL - ZERO TOLERANCE

1. **NEVER** run database migrations or modification commands (`prisma migrate`, `prisma db push`, etc.)
2. **NEVER** run commands on remote production instances (ssh, scp, remote commands)
3. **NEVER** run deployment scripts or remote orchestration commands
4. **NEVER** add `.env*` files to git
5. **NEVER** add deployment scripts with credentials/IPs to git
6. **NEVER** commit without explicit user permission
7. **NEVER** delete anything not tracked in git
8. **NEVER** manipulate untracked files without permission
9. **NEVER** run npm run  db:setup command

## DATABASE CHANGES

9. Edit `schema.prisma` with inline comments explaining purpose of new fields/models
10. Ask user to run `npm run db:prepare-migration` to create a new migration file
    - This script handles the naming convention (z_ prefix)
11. Add SQL to the created migration file:
    - Descriptive comments at the top
    - Forward migration (CREATE, ALTER, etc.)
    - Backward rollback plan as comments
12. Ask user to run `npm run db:test-migration` to verify
13. Ask user to run `npm run db:migrate` to apply changes - **NEVER** execute it yourself
14. Never drop columns without user approval (data loss risk)
15. Always add indexes for foreign keys

## TESTING

15. **ALWAYS** use `data-testid` - never text selectors or roles
16. **ALWAYS** add new text to `i18n.ts` - never hardcode strings in tests or components
17. **ALWAYS** add test IDs to `selectors.ts`
18. Wait for conditions, not timeouts (`waitFor()` not `waitForTimeout()`)
19. Use domain helpers for common operations (DRY principle)
20. Verify state, not just navigation (check visible elements, not just URL)

## CODE QUALITY

21. Ask before coding when requirements are ambiguous or complex
22. Default to industry-standard patterns and proven libraries
23. Every solution must be: scalable, fast (<200ms API), secure, maintainable, tested
24. Use React Portals (`createPortal`) for ALL modals/overlays to avoid z-index issues. Escapes overflow: hidden or transform on parent elements
Ensures correct centering relative to the viewport
25. **NEVER** hardcode currency symbols/codes - always use dynamic account currency
26. Use `Intl.NumberFormat` or centralized helper for currency formatting

## SECURITY

27. Validate and sanitize ALL user input
28. Use parameterized queries (Prisma handles this)
29. Never log sensitive data (passwords, tokens, PII)
30. Implement rate limiting on authentication endpoints
31. Never expose stack traces to users

## COMMUNICATION

32. Ask user when multiple approaches exist with trade-offs
33. Ask user about edge cases, performance requirements, security considerations
34. Explain WHY changes improve codebase before suggesting them
35. Provide options with pros/cons for design decisions

# AI Agent Global Rules - Trackio Application

## CRITICAL - ZERO TOLERANCE

1. **NEVER** run database migrations or modification commands (`prisma migrate`, `prisma db push`, etc.)
2. **NEVER** run commands on remote production instances (ssh, scp, remote commands)
3. **NEVER** run deployment scripts or remote orchestration commands
4. **NEVER** add `.env*` files to git
5. **NEVER** add deployment scripts with credentials/IPs to git
6. **NEVER** commit without explicit user permission
7. **NEVER** delete anything not tracked in git
8. **NEVER** manipulate untracked files without permission

## DATABASE CHANGES

9. Edit `schema.prisma` with inline comments explaining purpose of new fields/models
10. Ask user to run `npm run db:prepare-migration` to create a new migration file
    - This script handles the naming convention (z_ prefix)
11. Add SQL to the created migration file:
    - Descriptive comments at the top
    - Forward migration (CREATE, ALTER, etc.)
    - Backward rollback plan as comments
12. Ask user to run `npm run db:test-migration` to verify
13. Ask user to run `npm run db:migrate` to apply changes - **NEVER** execute it yourself
14. Never drop columns without user approval (data loss risk)
15. Always add indexes for foreign keys
16. **NEVER** Never modify migration files. NEVER!

## TESTING

15. **ALWAYS** use `data-testid` - never text selectors or roles
16. **ALWAYS** add new text to `i18n.ts` - never hardcode strings in tests or components
17. **ALWAYS** add test IDs to `selectors.ts`
18. Wait for conditions, not timeouts (`waitFor()` not `waitForTimeout()`)
19. Use domain helpers for common operations (DRY principle)
20. Verify state, not just navigation (check visible elements, not just URL)

## CODE QUALITY

21. Ask before coding when requirements are ambiguous or complex
22. Default to industry-standard patterns and proven libraries
23. Every solution must be: scalable, fast (<200ms API), secure, maintainable, tested
24. Use React Portals (`createPortal`) for ALL modals/overlays to avoid z-index issues. Escapes overflow: hidden or transform on parent elements
Ensures correct centering relative to the viewport
25. **NEVER** hardcode currency symbols/codes - always use dynamic account currency
26. Use `Intl.NumberFormat` or centralized helper for currency formatting

## SECURITY

27. Validate and sanitize ALL user input
28. Use parameterized queries (Prisma handles this)
29. Never log sensitive data (passwords, tokens, PII)
30. Implement rate limiting on authentication endpoints
31. Never expose stack traces to users

## COMMUNICATION

32. Ask user when multiple approaches exist with trade-offs
33. Ask user about edge cases, performance requirements, security considerations
34. Explain WHY changes improve codebase before suggesting them
35. Provide options with pros/cons for design decisions

never run npm run build

NEVER TRY TO OPEN BROWSERS TO DO CHECKS!
NEVER TRY TO USE TAILWIND CSS
NEVER REMOVE ELEMENTS FROM THE SIDEBAR UNLESS USER SAYS SO

## RELEASE VERSIONING

1. Release version source of truth is `package.json`
2. Version format is `YYYY.MINOR.PATCH`
3. For small changes, bugfixes, text tweaks, docs updates, or tiny UI adjustments run `npm run version:patch`
4. For a new feature or meaningful user-visible capability run `npm run version:minor`
5. At the start of a new year, or when resetting the release year, run `npm run version:year`
6. Every code or content change that ships should bump the version before commit/deploy
7. Do not use environment variables or the database as the primary release version source

## FLOW REFACTOR & MODULAR ARCHITECTURE (MANDATORY)

This is the required implementation standard for any new feature and any refactor of existing flows.

### Required folder structure per flow

For any flow, split code into:

- `app/<flow>/page.*` (routing entry only)
- `app/<flow>/<Flow>View.*` or `PageClient.*` (composition only)
- `app/<flow>/components/*` (presentational/UI)
- `app/<flow>/components/sections/*` (large page sections)
- `app/<flow>/components/charts/*` (chart-only components, if needed)
- `app/<flow>/hooks/*` (domain hooks + orchestration hooks)
- `app/<flow>/lib/*` (pure utils, mapping, formatting, derivations)
- `app/<flow>/constants/*` (static config/tabs/style maps)
- `*.module.css` per component/section for static styling

### Architecture contract

1. Page shell and view files are orchestration/composition only.
2. Business logic must live in hooks or pure utilities, not in JSX-heavy files.
3. Presentational components receive explicit props and avoid hidden dependencies.
4. Side effects are centralized in dedicated hooks/controllers.
5. No direct fetch/mutation in purely presentational components.

### Hard file size policy

These limits are mandatory:

- Page shell: max 200 lines
- UI component: max 250 lines
- Hook: max 250 lines
- Utility/config file: max 180 lines
- CSS module: max 220 lines
- Absolute cap: no file above 300 lines

If a file exceeds the limit, split before merging.

### CSS rules

1. One component/section should have its own CSS module where practical.
2. Move static inline styles into CSS modules.
3. Keep inline styles only for runtime-calculated values.
4. Use semantic class names, avoid visual-only naming.
5. Extract shared style primitives only when reused at least 3 times.

### Performance and stability rules

1. Refactor must keep functional parity.
2. Do not change API contracts during structural refactor unless explicitly requested.
3. Memoize expensive derivations where needed.
4. Keep handler identities stable where rerenders matter.
5. Preserve existing lazy-loading/portal behavior.

### Mandatory validation gates

Before committing:

1. Lint all touched files.
2. Build/typecheck according to project constraints used in this repo.
3. Verify line limits for the refactored flow.
4. Run smoke checks for critical user paths:
   - filters/search
   - create/edit/delete
   - modal open/close behavior
   - empty/loading/error states
   - export/print paths (if applicable)

No next step starts until the current gate passes.
