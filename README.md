# Royal Dutch Medical Centre Frontend

Next.js JSX + Tailwind CSS frontend for the Royal Dutch Medical Centre booking and admin system.

## Stack

- Next.js App Router
- React JSX
- Tailwind CSS
- Framer Motion
- React Hook Form
- Lucide React icons
- FastAPI backend integration

## Setup

Install dependencies:

```powershell
cd D:\ayati\royalduch\frontend
npm install
Copy-Item .env.local.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://royaldutch.onrender.com
```

Start the frontend:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

The backend should be running separately:

```powershell
cd D:\ayati\royalduch\backend
uvicorn app.main:app --reload
```

## Public Pages

- `/` home
- `/services` all services
- `/services/[category]` category services
- `/book` booking page
- `/book/[serviceSlug]` direct service booking
- `/booking-success` booking confirmation
- `/my-bookings` patient booking lookup

## Admin Pages

- `/admin/login` admin login
- `/admin/dashboard` daily workspace
- `/admin/bookings` appointment workflow
- `/admin/calendar` calendar view
- `/admin/services` service CRUD
- `/admin/categories` category CRUD
- `/admin/staff` staff and availability
- `/admin/patients` patient records
- `/admin/billing` finance desk and invoice flow
- `/admin/payments` payment history
- `/admin/mail` SMTP mail queue and compose
- `/admin/email-templates` reusable email templates
- `/admin/notifications` notification records
- `/admin/settings` operational settings reference

## Patient Booking Flow

The booking UI is a step-by-step flow:

1. Choose service
2. Choose staff or any available specialist
3. Choose date and time
4. Enter patient details
5. Confirm request

The booking is submitted as `pending`. Admin can confirm, complete, cancel, reschedule, or mark no-show from the admin panel.

## Admin Daily Workflow

Recommended clinic flow:

1. Open `/admin/dashboard`
2. Review pending bookings
3. Confirm appointment slots
4. View daily schedule in calendar
5. Complete the visit
6. Generate invoice in Finance Desk
7. Record payment
8. Send mail or notification

## Mail Workflow

Mail page:

```text
/admin/mail
```

Features:

- SMTP status card
- Test SMTP button
- Compose email
- To, CC and BCC fields
- Apply saved template
- Queue email
- Send single email
- Send all queued emails
- Retry failed emails
- Status filters: all, draft, queued, sent, failed

Template page:

```text
/admin/email-templates
```

Default templates:

- Booking request received
- Booking confirmed
- Booking cancelled
- Visit completed
- Appointment reminder
- Payment received

Supported placeholders:

```text
{patient_name}
{patient_email}
{patient_phone}
{service_name}
{staff_name}
{booking_code}
{booking_date}
{booking_time}
{appointment_time}
{clinic_name}
```

## Billing Flow

Finance Desk:

```text
/admin/billing
```

Flow:

1. Select booking
2. Generate invoice
3. Select invoice
4. Record payment
5. Invoice balance updates automatically

Payments page is read-only history and links users back to Finance Desk.

## Commands

Development:

```powershell
npm run dev
```

Production build:

```powershell
npm run build
```

Start production server after build:

```powershell
npm run start
```

Lint:

```powershell
npm run lint
```

## Backend Connection

Frontend API client lives in:

```text
src/lib/api.js
```

Default API base:

```text
http://127.0.0.1:8000/api/v1
```

Admin token is stored in browser local storage as:

```text
clinicflow_admin_token
```

## Theme

The interface uses the Royal Dutch premium clinic theme:

- Plum primary color
- Magenta accents
- White panels
- Soft borders
- Simple clinic workflow layout
