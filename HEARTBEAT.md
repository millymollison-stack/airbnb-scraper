# HEARTBEAT.md — Lightweight Periodic Checks
# Kept minimal. Heavy work offloaded to nightly cron.

## Memory Maintenance (run every few days — not every heartbeat)
- Review recent daily notes in memory/
- Update MEMORY.md with important learnings
- Prune anything outdated

## Servers / Quick Sanity Check (run once or twice daily)
- Check all servers are still up (lsof ports: 5174, 5175, 6905, 3099, 9100, 9103, 9000)
- Log any down servers to today's daily note

## Task Counter — Auto-Compaction Trigger
Every 10 user prompts, automatically:
1. Write a work summary to `knowledge/daily/YYYY-MM-DD.md`
2. Commit recent changes to git (in the project dir)
3. Scan for and remove any `.bak` or old `*.json~` files in the workspace
4. Post a brief notification to the chat

Count: currently at 0 (reset after each compaction)

## New Session Checklist (post-compaction)
After each session:
- [ ] Git commit in project dir
- [ ] Clean up any .bak / json~ files
- [ ] Note any pending issues in today's daily note
- [ ] Reset counter to 0