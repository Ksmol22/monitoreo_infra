## Packages
recharts | For data visualization and dashboard metrics
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
The dashboard uses a Red/White theme (#EC0000) as requested.
Metrics are stored in a JSONB column, so frontend handles type specific rendering.
Real-time feel is simulated via query invalidation or polling.
