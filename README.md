# Trackio

Configurable habit, routine, and activity tracking for real daily use.

The app supports:

- topics such as `Healthy Eating`, `Exercise`, `Reading`, `Sleep 8h`
- flexible recurrence rules
- `YES = 100`, `NO = 0`, or any custom percentage from `0` to `100`
- missing entries that stay neutral instead of being treated as `0`
- retroactive edits and notes
- calendar, matrix, topic, and stats views

## Current implementation

The shipped app is local-first and persists in browser storage so it works immediately without blocked database migrations.

The feature is intentionally split into:

- pure domain logic in [`app/tracker/lib`](/Users/naebara/projects/trackio/app/tracker/lib)
- state orchestration in [`app/tracker/hooks`](/Users/naebara/projects/trackio/app/tracker/hooks)
- reusable UI in [`app/tracker/components`](/Users/naebara/projects/trackio/app/tracker/components)
- route entrypoints in [`app/tracker/page.tsx`](/Users/naebara/projects/trackio/app/tracker/page.tsx) and [`app/page.tsx`](/Users/naebara/projects/trackio/app/page.tsx)

That separation is the foundation for moving persistence behind Prisma later without rewriting the recurrence engine or views.

## 1. Recommended architecture

Use a layered product architecture:

1. Presentation: page shells, tabs, cards, modals, matrix cells, calendar cells.
2. Application state: one tracker hook that owns topic and entry mutations plus hydration.
3. Domain engine: recurrence evaluation, expected-day generation, stats derivation, date helpers.
4. Persistence adapter: local storage now, Prisma repository later.

Recommended production path:

- keep the current domain layer unchanged
- add `TopicRepository` and `EntryRepository` interfaces
- implement a Prisma adapter behind server actions or route handlers
- scope data by authenticated `userId`
- add background jobs later for reminders/export

## 2. Data models / entities

Current app entities:

- `Topic`
  - `id`
  - `name`
  - `description`
  - `color`
  - `startDate`
  - `endDate`
  - `archivedAt`
  - `recurrence`
  - `createdAt`
  - `updatedAt`
- `RecurrenceRule`
  - `type`: `daily | everyXDays | selectedWeekdays | weekly | monthly | custom`
  - `interval`
  - `weekdays`
  - `dayOfWeek`
  - `dayOfMonth`
  - `unit`
- `DailyEntry`
  - `id`
  - `topicId`
  - `date`
  - `value`
  - `note`
  - `createdAt`
  - `updatedAt`
- `TopicStats`
  - derived only
  - expected days
  - logged days
  - pending days
  - average logged value
  - coverage rate

Recommended future Prisma entities:

- `User`
- `Topic`
- `TopicRecurrence`
- `DailyEntry`
- `TopicCategory`
- `Reminder`
- `AuditEvent`

## 3. Main business rules

- Missing entry is not `0%`.
- Only expected days count toward compliance-related metrics.
- Non-expected days are ignored in stats and matrix calculations.
- Archived topics stop generating future expectations but preserve history.
- Future start dates do not generate expected days before the topic starts.
- End dates stop expectation generation after the end is reached.
- Retroactive edits are valid and update all derived views immediately.
- Custom percentages are clamped to `0..100`.
- Coverage answers “was this expected day logged?”
- Average logged value answers “how strong were the logged completions?”

## 4. Page structure

- `/` redirects to `/tracker`
- `/tracker`
  - hero summary with selected day and global metrics
  - `Today` tab for fast day check-in
  - `Calendar` tab for month summary plus day detail
  - `Matrix` tab for topic x day editing
  - `Topics` tab for create/edit/archive/delete
  - `Insights` tab for per-topic performance

## 5. Reusable UI components

- `HeroSection`
- `DayBoardSection`
- `CalendarSection`
- `MatrixSection`
- `TopicsSection`
- `InsightsSection`
- `TopicFormModal`
- `EntryFormModal`
- `QuickLogActions`
- `StatCard`

## 6. State management approach

State is owned by [`useTrackerApp.ts`](/Users/naebara/projects/trackio/app/tracker/hooks/useTrackerApp.ts):

- `useReducer` for deterministic topic and entry mutations
- derived maps and stats via memoized selectors
- local persistence adapter for hydration and save
- one shared state source updates today view, calendar, matrix, and insights immediately

## 7. Clean, scalable implementation details

Scalability choices already in place:

- recurrence logic is pure and reusable
- stats are derived, not stored
- storage is isolated behind helper functions
- presentational components do not mutate state directly
- route shell stays thin
- CSS is split per component/section

To scale toward production:

- move persistence to Prisma repositories
- add optimistic server actions
- add per-user filtering and auth guards
- add export/reminder services without touching the UI layer

## 8. Seed / demo data

The app ships seeded topics in [`demoData.ts`](/Users/naebara/projects/trackio/app/tracker/constants/demoData.ts):

- Healthy Eating
- Exercise
- Reading
- Sleep 8h
- Deep Work
- Monthly Review

It also seeds realistic entries including:

- `100`
- `0`
- partial values like `65` and `80`
- notes

## 9. Folder structure

```text
app/
  page.tsx
  tracker/
    page.tsx
    TrackerView.tsx
    components/
      sections/
    constants/
    hooks/
    lib/
scripts/
  version-bump.mjs
```

## 10. Run instructions

1. Install dependencies if needed:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

4. Version bump for feature releases:

```bash
npm run version:minor
```

## Notes

- No database migrations were run.
- The current feature persists locally in browser storage by design.
- If you want a Prisma-backed multi-user version next, add the new schema models and migration separately, then swap the storage adapter.
