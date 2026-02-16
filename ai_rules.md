# AI Agent Global Rules - Finance Application

## CRITICAL - ZERO TOLERANCE

1. **NEVER** run database migrations or modification commands (`prisma migrate`, `prisma db push`, etc.)
2. **NEVER** run commands on AWS/EC2 instances (ssh, scp, remote commands)
3. **NEVER** run deployment scripts (deploy-aws.sh, start-aws.sh, etc.)
4. **NEVER** add `.env*` files to git
5. **NEVER** add deployment scripts with credentials/IPs to git
6. **NEVER** commit without explicit user permission
7. **NEVER** delete anything not tracked in git
8. **NEVER** manipulate untracked files without permission

## DATABASE CHANGES

9. Edit `schema.prisma` with inline comments explaining purpose of new fields/models
10. Create migration files as `prisma/migrations/z_000X_<descriptive_slug>/migration.sql`
    - Check existing migrations with `z_` prefix using `view` or `bash_tool`
    - Use the next sequential number (if `z_0003` exists, use `z_0004`)
    - If no `z_` migrations exist, start with `z_0001`
11. Include in migration SQL:
    - Descriptive comments at the top
    - Forward migration (CREATE, ALTER, etc.)
    - Backward rollback plan as comments
12. **STOP** - ask user to run `npx prisma migrate deploy` - **NEVER** execute it yourself
13. Never drop columns without user approval (data loss risk)
14. Always add indexes for foreign keys

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