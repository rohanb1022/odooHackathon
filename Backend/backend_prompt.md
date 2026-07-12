# AssetFlow Backend Specification

## Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- MVC Architecture

## Architecture
```
frontend -> backend -> backend-ml
                     |
                  MongoDB
```

Backend is the **only** service allowed to read/write MongoDB.

## Folder Structure
```text
src/
 controllers/
 routes/
 services/
 models/
 middlewares/
 validators/
 utils/
 sockets/
 config/
```

## Collections
- User
- Department
- AssetCategory
- Asset
- Allocation
- TransferRequest
- Booking
- MaintenanceRequest
- AuditCycle
- AuditRecord
- Notification
- ActivityLog

## Authentication APIs

### POST /api/v1/auth/register
Purpose: Register employee.
Request:
```json
{"name":"","email":"","password":"","departmentId":""}
```
Response:
```json
{"success":true,"user":{},"token":"JWT"}
```

### POST /api/v1/auth/login
Purpose: Login.

### POST /api/v1/auth/logout
Purpose: Logout.

### GET /api/v1/auth/me
Purpose: Logged in profile.

## User APIs
GET /users
GET /users/:id
PATCH /users/:id/promote
PATCH /users/:id/status

## Department APIs
POST /departments
GET /departments
GET /departments/:id
PATCH /departments/:id
DELETE /departments/:id

## Asset Category APIs
POST /asset-categories
GET /asset-categories
PATCH /asset-categories/:id
DELETE /asset-categories/:id

## Asset APIs

### POST /assets
Registers asset.
Request:
```json
{
"name":"",
"categoryId":"",
"serialNumber":"",
"location":"",
"condition":"",
"isBookable":true
}
```
Response returns generated AssetTag (AF-0001).

### GET /assets
Supports filters:
category,status,location,department,assetTag.

### GET /assets/:id
Returns:
- Asset
- Current Holder
- Allocation History
- Maintenance History
- Booking History

### PATCH /assets/:id
Update asset.

### DELETE /assets/:id
Soft delete.

### GET /assets/:id/qr
Returns QR image/url.

## Allocation APIs
POST /allocations
Business Rules:
- Asset must be Available.
- Prevent double allocation.
Creates notification + activity log.

POST /allocations/return
Marks returned.
Stores condition notes.
Status -> Available.

GET /allocations
GET /allocations/overdue

## Transfer APIs
POST /transfer-requests
GET /transfer-requests
PATCH /transfer-requests/:id/approve
PATCH /transfer-requests/:id/reject

## Booking APIs
POST /bookings
Business Rule:
Reject overlapping bookings.

GET /bookings
PATCH /bookings/:id/reschedule
PATCH /bookings/:id/cancel

## Maintenance APIs
POST /maintenance
Creates Pending request.

PATCH /maintenance/:id/approve
Status -> Under Maintenance.

PATCH /maintenance/:id/reject

PATCH /maintenance/:id/start

PATCH /maintenance/:id/resolve
Status -> Available.

GET /maintenance

## Audit APIs
POST /audit-cycles
POST /audit-cycles/:id/assign
POST /audit-cycles/:id/verify
POST /audit-cycles/:id/close
GET /audit-cycles

## Dashboard
GET /dashboard
Returns KPI cards:
Assets Available
Allocated
Maintenance
Bookings
Overdue
Transfers
Notifications

## Reports
GET /reports/assets
GET /reports/utilization
GET /reports/maintenance
GET /reports/departments

## Notifications
GET /notifications
PATCH /notifications/:id/read

## Activity Logs
GET /activity-logs

Every mutation endpoint writes an ActivityLog.

## Backend -> ML Contract

Backend calls only these endpoints:

POST http://backend-ml:8000/api/v1/analyze-maintenance
POST http://backend-ml:8000/api/v1/asset-health
POST http://backend-ml:8000/api/v1/predict-maintenance
POST http://backend-ml:8000/api/v1/chat

Frontend NEVER communicates with backend-ml directly.
