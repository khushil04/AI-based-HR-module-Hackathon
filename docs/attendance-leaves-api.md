# Attendance & Leave API

Base URL: `http://localhost:5000/api`  
Header: `Authorization: Bearer <token>`

## Link user to employee

Employees must have `userId` set to the auth user's MongoDB `_id` for self-service check-in and leave requests. HR can set this when creating/updating employee records.

## Attendance

| Method | Route | Roles |
|--------|-------|-------|
| POST | `/attendance/check-in` | ADMIN, MANAGER, EMPLOYEE |
| POST | `/attendance/check-out` | ADMIN, MANAGER, EMPLOYEE |
| GET | `/attendance/today` | ADMIN, MANAGER, EMPLOYEE |
| GET | `/attendance` | All authenticated (employees see own) |
| GET | `/attendance/report` | All authenticated |

Query for list: `page`, `limit`, `from`, `to`, `status`, `employeeId` (admin/manager).

## Leaves

| Method | Route | Roles |
|--------|-------|-------|
| GET | `/leaves` | ADMIN, MANAGER, EMPLOYEE |
| POST | `/leaves` | ADMIN, MANAGER, EMPLOYEE |
| PATCH | `/leaves/:id/status` | ADMIN, MANAGER |

Create body:

```json
{
  "type": "CASUAL",
  "startDate": "2026-06-10",
  "endDate": "2026-06-12",
  "reason": "Family event"
}
```

Review body:

```json
{
  "status": "APPROVED",
  "reviewNote": "Approved"
}
```
