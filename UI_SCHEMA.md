# UI Schema - Apartment Management System

## Overview

This document defines the complete UI schema for the Apartment Management System, including navigation structure, page layouts, components, and role-based access control.

## System Roles

- **Residents** (Cư dân): Primary users who live in the apartment complex
- **Admin** (Quản trị viên): Building management staff with full system access
- **Law Enforcement** (Công an): Police officers who need access to security reports and incident data
- **Accountant** (Kế toán): Financial staff responsible for billing and financial reporting

---

## Navigation Structure

### Sidebar Navigation

The sidebar provides hierarchical navigation organized by epics. Each epic contains multiple pages that may serve multiple user stories.

```
┌─────────────────────────────────────┐
│  Apartment Management System        │
├─────────────────────────────────────┤
│  📋 Dashboard                        │
│                                     │
│  👥 EP1 - Resident Management       │
│    ├─ Resident Profiles             │
│    ├─ Apartment Directory           │
│    ├─ Access Control                │
│    ├─ Document Management           │
│    └─ Residence Status              │
│                                     │
│  🏢 EP2 - Property Management       │
│    ├─ Properties                    │
│    └─ Lost Property Report          │
│                                     │
│  💰 EP3 - Fee Collection            │
│    ├─ Service Catalog & Cart        │
│    ├─ Billing & Invoice Center      │
│    ├─ Service Administration        │
│    └─ Financial Reports             │
│                                     │
│  📢 EP4 - Notifications             │
│    ├─ Public Announcements          │
│    └─ Feedback                │
│                                     │
│  🛠️ EP5 - Building Services         │
│    ├─ Service Booking               │
│    └─ Customer Support              │
│                                     │
│  ⚙️ EP6 - System Operations         │
│    └─ System Settings               │
│                                     │
│  📊 EP7 - Reports & Analytics       │
│    ├─ Security Reports              │
│    ├─ Financial Reports             │
│    └─ General Reports               │
└─────────────────────────────────────┘
```

---

## Page Specifications

### 1. Dashboard

**Route:** `/dashboard`  
**Access:** All roles  
**Layout:** Main content area with cards and widgets

**Components:**
- Welcome header with user name and role badge
- Quick stats cards (4-column grid):
  - Total Residents
  - Pending Payments
  - Active Incidents
  - Unread Notifications
- Recent activity feed (scrollable list)
- Quick actions buttons:
  - New Payment (Residents, Accountant)
  - Report Incident (Residents, Admin)
  - View Reports (Admin, Law Enforcement, Accountant)
- Upcoming events/announcements section

**Content:**
- Personalized greeting based on role
- Role-specific widgets and shortcuts
- System notifications banner (if any)

---

### 2. EP1 - Resident Management

#### 2.1 Resident Profiles

**Route:** `/residents/profiles`  
**Access:** Residents (own profile), Admin (all profiles)  
**Layout:** List view with search and filters, detail view modal/sidebar

**Components:**
- Search bar with filters:
  - Name search
  - Apartment number filter
  - Status filter (Active, Temporary, Absent)
  - Role filter (Admin only)
- Data table with columns:
  - Avatar + Name
  - Apartment Number
  - Contact Info
  - Status Badge
  - Actions (View, Edit, Delete)
- Profile detail view (drawer/sidebar):
  - Personal information form
  - Apartment assignment
  - Contact details
  - Emergency contacts
  - Profile photo upload
  - Save/Cancel buttons

**Content:**
- Form fields for US-001:
  - Full name
  - ID number
  - Date of birth
  - Phone number
  - Email
  - Address
  - Emergency contact
  - Profile photo

**User Stories:** US-001, US-017

---

#### 2.2 Apartment Directory

**Route:** `/residents/apartments`  
**Access:** All roles (different views)  
**Layout:** Grid/list view with building/floor organization

**Components:**
- Building selector dropdown
- Floor selector (if multi-floor)
- Apartment grid cards:
  - Apartment number
  - Floor number
  - Area (sqm)
  - Current residents (avatar list)
  - Occupancy status
  - Quick actions
- Apartment detail modal:
  - Full information display
  - Resident list with contact info
  - Apartment history
  - Documents related to apartment

**Content:**
- Building information (US-002)
- Apartment details
- Resident roster per apartment
- Floor plans (if available)

**User Stories:** US-002

---

#### 2.3 Access Control

**Route:** `/residents/access-control`  
**Access:** Residents (own access), Admin (all access), Law Enforcement (view only)  
**Layout:** Split view - People log and Vehicle log

**Components:**
- Tabs: "People Access" and "Vehicle Access"
- People Access tab:
  - Entry/exit log table
  - Columns: Name, ID, Time, Type (Entry/Exit), Status
  - Filter by date range
  - Export button
- Vehicle Access tab:
  - Vehicle registration list
  - Entry/exit log for vehicles
  - Columns: Vehicle plate, Owner, Entry time, Exit time, Status
  - Check-in/Check-out buttons (for residents)
  - Filter and search
- Real-time status indicators
- Access control settings (Admin only)

**Content:**
- Access logs (US-009)
- Vehicle registration forms
- Access history
- Current status display

**User Stories:** US-009

---

#### 2.4 Document Management

**Route:** `/residents/documents`  
**Access:** Residents (own documents), Admin (all documents)  
**Layout:** File browser with upload area

**Components:**
- Document upload zone (drag & drop)
- Document category tabs:
  - Personal Documents
  - Apartment Documents
  - Building Documents
  - Legal Documents
- Document list/grid:
  - File icon + name
  - Category badge
  - Upload date
  - File size
  - Actions (View, Download, Delete)
- Document viewer modal:
  - PDF viewer
  - Download button
  - Share button (if applicable)
- Search and filter by category/date

**Content:**
- Electronic document storage (US-011)
- Document categorization
- Upload interface
- Document preview

**User Stories:** US-011

---

#### 2.5 Residence Status

**Route:** `/residents/status`  
**Access:** Admin (full access), Residents (view own status)  
**Layout:** Status management dashboard

**Components:**
- Status overview cards:
  - Active residents count
  - Temporary residents count
  - Absent residents count
- Resident status list table:
  - Name
  - Apartment
  - Current status
  - Status change date
  - Actions (Change status)
- Status change form (modal):
  - Status selector (Active, Temporary, Absent)
  - Start date
  - End date (for temporary)
  - Reason
  - Notes
- Status history timeline view

**Content:**
- Residence status tracking (US-017)
- Status change workflow
- Historical status records

**User Stories:** US-017

---

### 3. EP2 - Property Management

#### 3.1 Properties

**Route:** `/property`  
**Access:** Residents (create/view own), Admin (all)
**Layout:** Property list with creation form

**Components:**
- Property creation button (floating action button)
- Property list with filters:
  - Status filter (Found, Not Found, Deleted)
  - Date range filter
  - Type filter
- Property cards/list items:
  - Property ID
  - Title
  - Status badge
  - Created date
  - Actions (View, Update status)

---

#### 3.2 Lost Property

**Route:** `/property/lost-property`  
**Access:** Residents (create/view), Admin (all), Police (all)  
**Layout:** Lost property registry

**Components:**
- Report lost property button
- Lost property list:
  - Item name
  - Description
  - Reported by
  - Reported date
  - Status (Not Found, Found, Claimed)
  - Actions (View details, Mark found)
- Lost property report form:
  - Item name
  - Category selector
  - Description
  - Last seen location
  - Last seen date/time
  - Contact information
- Found property section (Admin):
  - List of found items
  - Match with lost reports
  - Claim process

**Content:**
- Lost property reporting (US-024)
- Property matching system
- Claim workflow

**User Stories:** US-024

---

### 4. EP3 - Fee Collection

#### 4.1 Service Catalog & Cart

**Route:** `/services/catalog`  
**Access:** Residents (browse/add/pay), Admin (view)  
**Layout:** Service marketplace with cart drawer and checkout lane

**Components:**
- Service filters:
  - Category tabs (Cleaning, Maintenance, Utilities, Amenities)
  - Search bar and price range slider
- Service cards:
  - Name, description, duration, price, availability status
  - `Add to cart` button with quantity selector
- Cart drawer:
  - Selected services list with editable quantity
  - Subtotal, tax/fee breakdown, promo code input
  - `Proceed to payment` button launching checkout modal
- Checkout modal:
  - Selected services summary
  - Payment method selector (Bank transfer, Card, E-wallet)
  - Billing contact info and optional notes
  - Confirmation + success toast
- Order history snippet for quick rebooking

**Content:**
- Tenant-facing service discovery (US-005, US-007)
- Shopping cart + checkout workflow
- Real-time availability updates

**User Stories:** US-005, US-007

---

#### 4.2 Billing & Invoice Center

**Route:** `/services/billing`  
**Access:** Residents (own bills), Admin (all bills)  
**Layout:** Unified billing dashboard with detail drawer

**Components:**
- Billing overview cards (Total due, Upcoming due date, Paid this month)
- Bill list table:
  - Bill number, service bundle, period, amount, due date, status
  - Bulk select for multi-bill payment
- Bill detail drawer:
  - Charge breakdown, adjustments, previous payments
  - `Pay selected bill` action
  - `Generate invoice` button producing PDF/email
- Payment panel:
  - Supports partial payments and stored methods
  - Upload receipt + reference ID for manual proofs
- Invoice history:
  - Download links, resend via email, status badges
- Filters and export (Admin only)

**Content:**
- Tenant bill tracking + payment execution (US-012, US-014)
- Instant invoice generation per payment
- Admin visibility on every bill

**User Stories:** US-012, US-014

---

#### 4.3 Service Administration

**Route:** `/services/manage`  
**Access:** Admin  
**Layout:** Admin workspace with CRUD grid and bill ledger

**Components:**
- Service list DataTable:
  - Columns: Service name, category, price, availability, last updated
  - Actions: View, Edit, Duplicate, Delete
- Service editor modal:
  - Form fields for metadata, pricing tiers, capacity windows, attachments
  - Publish/unpublish toggle with preview
- New service wizard with validation and draft saving
- Bill ledger tab:
  - All bills generated from service orders
  - Filters by resident, status, period
  - Inline link to billing detail page
- Audit log of service changes

**Content:**
- Admin CRUD for catalog (US-004, US-007)
- End-to-end visibility on every bill raised from services
- Governance trail for compliance

**User Stories:** US-004, US-007

---

#### 4.4 Financial Reports

**Route:** `/services/reports`  
**Access:** Admin, Accountant  
**Layout:** Report dashboard with charts

**Components:**
- Report type selector:
  - Revenue reports
  - Collection reports
  - Outstanding reports
  - Tax reports
- Date range picker
- Report generation button
- Chart visualizations:
  - Revenue trend (line chart)
  - Collection rate (pie chart)
  - Outstanding by month (bar chart)
- Report table:
  - Detailed financial data
  - Export options (PDF, Excel, CSV)
- Report templates:
  - Standard financial report
  - Tax report format
  - Custom report builder

**Content:**
- Financial report generation (US-013)
- Tax report export (US-015)
- Data visualization for Accountant/Admin review

**User Stories:** US-013, US-015, US-018

---

### 5. EP4 - Notifications

#### 5.1 Public Announcements

**Route:** `/notifications/announcements`  
**Access:** All roles  
**Layout:** Announcement feed with categories

**Components:**
- Announcement categories tabs:
  - All
  - Fees & Billing
  - Maintenance
  - Building Issues
  - General
- Announcement cards:
  - Title
  - Category badge
  - Author
  - Publish date
  - Content preview
  - Read more button
- Announcement detail view:
  - Full content
- Create announcement (Everyone):
  - Title
  - Category
  - Content (written in markdown)
  - Publish button

**Content:**
- Building notifications (US-003)
- Fee notifications
- Maintenance alerts
- General announcements

**User Stories:** US-003, US-016

---

#### 5.2 Feedback

**Route:** `/notifications/feedbacks`  
**Access:** All roles  
**Layout:** Feedback list with search and filters
**Description:** Feedback is a way for residents to give feedback to the building management. It is meant to be a private communication channel.

**Components:**
- Feedback list:
  - Show all feedbacks for admin
  - For residents, show only their feedbacks
  - Feedback ID
  - Feedback content
  - Feedback date
  - Feedback tags
  - Feedback status (Open, In Progress, Resolved, Closed)

**Content:**
- Feedback collection
- Feedback management 

**User Stories:** US-016, US-019

---

### 6. EP5 - Services

#### 6.1 Service Booking

**Route:** `/services/booking`  
**Access:** Residents (book services), Admin (manage services)  
**Layout:** Service catalog with booking calendar

**Components:**
- Service category tabs:
  - Cleaning
  - Maintenance
  - Utilities
  - Amenities
  - Other
- Service cards:
  - Service name
  - Description
  - Price (if applicable)
  - Duration
  - Availability
  - Book button
- Booking form (modal):
  - Service selector
  - Date picker
  - Time slot selector
  - Special requests (textarea)
  - Contact info
  - Confirm booking button
- My bookings section:
  - Upcoming bookings
  - Past bookings
  - Booking status
  - Cancel/Reschedule options
- Service management (Admin):
  - Add/edit services
  - Set availability
  - Manage bookings
  - Service calendar view

**Content:**
- Service registration (US-007)
- Online booking interface
- Booking management

**User Stories:** US-007

---

#### 6.2 Customer Support

**Route:** `/services/support`  
**Access:** Residents (submit feedback), Admin (manage feedback)  
**Layout:** Support ticket system

**Components:**
- Support ticket list:
  - Ticket ID
  - Subject
  - Category
  - Status (Open, In Progress, Resolved, Closed)
  - Priority
  - Created date
  - Actions (View, Update)
- Create ticket button:
  - Category selector
  - Subject
  - Description
  - Priority
  - Attachments
  - Submit button
- Ticket detail view:
  - Full ticket information
  - Response thread
  - Status timeline
  - Add response/comment
  - Close ticket button
- Feedback/rating system:
  - Service rating (1-5 stars)
  - Feedback form
  - Submit feedback button
- Feedback dashboard (Admin):
  - All feedback list
  - Rating statistics
  - Response management

**Content:**
- Customer service interface (US-006)
- Feedback collection
- Service evaluation

**User Stories:** US-006, US-019

---

### 7. EP6 - System Operations

#### 7.1 System Settings

**Route:** `/system/settings`  
**Access:** Admin only  
**Layout:** Settings panel with sections

**Components:**
- Settings navigation tabs:
  - General
  - Security
  - Backup
  - Notifications
  - Integration
- General settings:
  - System name
  - Logo upload
  - Timezone
  - Language
  - Date format
- Security settings:
  - Password policy
  - Session timeout
  - Two-factor authentication
  - Access logs
- Backup settings:
  - Backup schedule
  - Backup location
  - Manual backup button
  - Restore options
  - Backup history
- Notification settings:
  - Email configuration
  - SMS configuration
  - Notification templates
- Integration settings:
  - Payment gateway
  - Email service
  - Storage service
- Performance monitoring:
  - System health dashboard
  - Response time metrics
  - Error logs

**Content:**
- System configuration (US-004)
- Security settings (US-020)
- Backup configuration (US-022)

**User Stories:** US-004, US-020, US-022

---

### 8. EP7 - Reports & Analytics

#### 8.1 Security Reports

**Route:** `/reports/security`  
**Access:** Admin, Law Enforcement  
**Layout:** Report dashboard with data tables

**Components:**
- Report type selector:
  - Daily security report
  - Weekly security report
  - Monthly security report
  - Incident summary
  - Access control report
- Date range picker
- Report parameters:
  - Building selector
  - Incident type filter
  - Severity filter
- Generate report button
- Report preview:
  - Summary statistics
  - Incident list
  - Access logs
  - Charts/graphs
- Export options:
  - PDF export
  - Excel export
  - Email report
- Scheduled reports (Admin):
  - Set up automatic reports
  - Recipient list
  - Schedule configuration

**Content:**
- Security reporting (US-010)
- Periodic reports for law enforcement
- Incident summaries

**User Stories:** US-010

---

#### 8.2 Financial Reports

**Route:** `/reports/financial`  
**Access:** Admin, Accountant  
**Layout:** Financial analytics dashboard

**Components:**
- Report type selector:
  - Revenue report
  - Collection report
  - Outstanding report
  - Tax report
  - Custom report
- Date range picker
- Report filters:
  - Apartment filter
  - Service type filter
  - Payment status
- Report generation
- Visualization charts:
  - Revenue trends
  - Collection rates
  - Outstanding analysis
- Data table:
  - Detailed financial data
  - Sorting and filtering
- Export options:
  - PDF (standard format)
  - Excel
  - CSV
  - Tax format export

**Content:**
- Financial reporting (US-013)
- Tax report generation (US-015)
- Data export

**User Stories:** US-013, US-015

---

#### 8.3 General Reports

**Route:** `/reports/general`  
**Access:** Admin  
**Layout:** Report builder interface

**Components:**
- Report builder:
  - Data source selector
  - Field selector
  - Filter builder
  - Grouping options
  - Sorting options
- Pre-built report templates:
  - Resident report
  - Apartment occupancy
  - Service usage
  - Document inventory
- Report preview
- Export options
- Save report template
- Quick report generation:
  - One-click common reports
  - Report history
  - Favorite reports

**Content:**
- Report generation (US-021)
- Custom report builder
- Data aggregation

**User Stories:** US-021

---

## Component Library

### Reusable Components

1. **DataTable**
   - Sortable columns
   - Filtering
   - Pagination
   - Row selection
   - Export functionality

2. **Form Components**
   - Input fields (text, number, email, phone)
   - Select dropdowns
   - Date pickers
   - File upload
   - Rich text editor
   - Form validation

3. **Status Badges**
   - Color-coded status indicators
   - Customizable colors per status type

4. **Modal/Dialog**
   - Confirmation dialogs
   - Form dialogs
   - Detail view dialogs

5. **Cards**
   - Information cards
   - Stat cards
   - Action cards

6. **Charts**
   - Line charts (trends)
   - Bar charts (comparisons)
   - Pie charts (distributions)
   - Area charts

7. **Navigation**
   - Sidebar navigation
   - Breadcrumbs
   - Tabs
   - Pagination

8. **Notifications**
   - Toast notifications
   - Alert banners
   - Notification badges

---

## Role-Based Access Matrix

| Page | Residents | Admin | Law Enforcement | Accountant |
|------|-----------|-------|------------------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Resident Profiles | Own only | ✅ All | ❌ | ❌ |
| Apartment Directory | ✅ View | ✅ Full | ✅ View | ✅ View |
| Access Control | Own only | ✅ All | ✅ View | ❌ |
| Document Management | Own only | ✅ All | ❌ | ❌ |
| Residence Status | Own only | ✅ All | ❌ | ❌ |
| Incident Reports | Create/View own | ✅ All | ✅ All | ❌ |
| Lost Property | Create/View | ✅ All | ❌ | ❌ |
| Service Bills | Own only | ✅ All | ❌ | ✅ All |
| Payment Processing | Make payments | ✅ All | ❌ | ✅ View |
| Invoice Management | Own only | ✅ All | ❌ | ✅ All |
| Financial Reports | ❌ | ✅ | ❌ | ✅ |
| Public Announcements | ✅ | ✅ | ✅ | ✅ |
| Direct Messages | ✅ | ✅ | ✅ | ✅ |
| Service Booking | Book services | ✅ Manage | ❌ | ❌ |
| Customer Support | Submit tickets | ✅ Manage | ❌ | ❌ |
| System Settings | ❌ | ✅ | ❌ | ❌ |
| Security Reports | ❌ | ✅ | ✅ | ❌ |
| General Reports | ❌ | ✅ | ❌ | ❌ |

---

## Layout Structure

### Main Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
│ [Logo] [Search] [Notifications] [User Menu] [Theme]    │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Main Content Area                          │
│          │                                              │
│ [Nav]    │  [Page Content]                             │
│          │                                              │
│          │  [Components]                              │
│          │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Responsive Behavior

- **Desktop (>1024px)**: Sidebar always visible, full layout
- **Tablet (768px-1024px)**: Collapsible sidebar, hamburger menu
- **Mobile (<768px)**: Hidden sidebar, bottom navigation or drawer menu

---

## Design Guidelines

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Info: Cyan (#06B6D4)

### Typography
- Headings: Inter, Bold
- Body: Inter, Regular
- Code: JetBrains Mono

### Spacing
- Base unit: 4px
- Consistent padding: 16px, 24px, 32px
- Card spacing: 16px
- Section spacing: 32px

### Components Style
- Rounded corners: 8px (default), 12px (cards)
- Shadows: Subtle elevation for cards
- Borders: 1px solid, light gray
- Icons: Lucide React, 20px default size

---

## User Experience Considerations

1. **Loading States**: Skeleton loaders for all data fetching
2. **Error Handling**: User-friendly error messages with retry options
3. **Empty States**: Helpful messages and action prompts
4. **Form Validation**: Real-time validation with clear error messages
5. **Confirmation Dialogs**: For destructive actions
6. **Success Feedback**: Toast notifications for completed actions
7. **Keyboard Navigation**: Full keyboard support for accessibility
8. **Responsive Design**: Mobile-first approach
9. **Dark Mode**: Theme toggle support
10. **Internationalization**: Support for Vietnamese and English

---

## Implementation Notes

- All pages should use the shadcn/ui component library
- Follow Next.js Pages Router structure
- Implement role-based route protection in middleware
- Use Zustand for client-side state management
- API routes should validate user roles
- All forms should use react-hook-form with zod validation
- Implement proper error boundaries
- Add loading states for all async operations
- Use TypeScript for type safety

---

## Future Enhancements

- Mobile app version
- Real-time notifications (WebSocket)
- Advanced analytics dashboard
- Multi-language support expansion
- Advanced search functionality
- Bulk operations UI
- Customizable dashboard widgets
- Report scheduling UI
- Integration with external services UI

