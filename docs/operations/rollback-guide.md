# Rollback Guide

## Docs Rollback
If this documentation split causes issues:
1. Restore affected files from git history.
2. Keep canonical technical notes in one file (`docs/memory/techContext.md`).
3. Re-apply section split gradually by domain (`technical`, `reference`, `product`).

## Tooling Rollback (CGC)
If CGC setup is unstable:
1. Stop using direct `cgc` calls.
2. Use only `scripts/cgc.ps1` wrapper.
3. Remove local `.cgc_home` and re-index.
