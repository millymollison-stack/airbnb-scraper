# Knowledge Management System - Second Brain

Based on Tiago Forte's "Building a Second Brain" methodology.

## Structure

- **/daily** - Daily notes (YYYY-MM-DD.md)
- **/projects** - Active project notes
- **/notes** - Fleeting notes and ideas
- **/archive** - Completed/archived items

## Daily Workflow

### Morning (Heartbeat)
- Check today's daily note
- Review active projects
- Note priorities for the day

### Evening (Consolidation)
- Review all chat sessions from the day
- Extract key learnings
- Update relevant project notes
- Log important information

### Nightly Cron (2AM)
- Run consolidation
- Parse session history
- Update knowledge files
- Re-index for search

## Priority Levels

1. **Critical** - Must remember, actionable
2. **Important** - Relevant to projects
3. **Reference** - Worth keeping
4. **Archive** - Move old items here

## Commands

- List today's priorities: Check daily note
- Add note: Create in /notes, then consolidate
- Archive: Move completed project notes to /archive
