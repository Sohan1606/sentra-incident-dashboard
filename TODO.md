# Enhancement Plan for Staff Assigned Incidents

## AdminDashboard Enhancements
- [x] Replace mock staff list with real staff from /api/users/staff
- [x] Implement actual assignment API call to /api/incidents/:id/assign
- [x] Update assignment logic to use real staff IDs

## StaffDashboard Enhancements
- [x] Add search functionality for incidents (by title, ID, category)
- [x] Add filter by status, priority, category
- [x] Improve UI for better incident management

## Testing
- [ ] Test staff assignment from admin
- [ ] Test staff viewing assigned incidents
- [ ] Test search and filter in staff dashboard
