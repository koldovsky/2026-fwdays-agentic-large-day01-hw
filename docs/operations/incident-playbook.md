# Incident Playbook

## Current Known Risk
- CGC default profile path (`C:\Users\arabu\.codegraphcontext`) may be non-writable in this environment.

## Mitigation
- Use wrapper script `scripts/cgc.ps1` to run CGC with local `.cgc_home`.

## Verification
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 doctor
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 list
```

## Reference
- `docs/reference/codegraphcontext.md`


