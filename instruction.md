# Apartment Management System - Instructions
This guide will help you navigate and use all the features of the system.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login](#login)
3. [Main Dashboard](#main-dashboard)
4. [Resident Features](#resident-features)
5. [Admin Features](#admin-features)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is this system?

The Apartment Management System helps you:
- Manage your apartment information
- Track your vehicle entry and exit
- Store important documents online
- Report missing items
- Stay connected with your community
- Administer building operations (for admins)

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Access credentials (provided by your administrator)

---

## Login

### How to Log In

1. Navigate to the system login page
2. Enter your credentials (which will be implemented later), OR
3. Use one of the demo accounts:

   **Demo Admin Account**
   - For building administrators
   - Access: Admin dashboard and all features

   **Demo Tenant 1/2 Accounts**
   - For regular residents
   - Access: Resident features

4. Click "Sign In"
5. You'll be redirected to the main feed

### Profile Management

- Click "Profile" in the top right
- Update your information:
  - Full name
  - Email
  - Year of birth
  - Gender
  - Role (admin only)
- Click "Save" to apply changes

### Sign Out

- Click "Sign Out" in the top right corner

---

## Main Dashboard

### Navigation

The main feed shows:
- **Posts**: Community announcements and updates
- **Property Reports**: Missing item notifications
- Items are sorted by newest first

### Creating Content

**Create a Post**
1. Click "Create Post" button
2. Type your message
3. Click "Submit"
4. Post appears in the feed

**Report Missing Property**
1. Click "Report Missing Property"
2. Select a property from the dropdown
3. Add description/details
4. Click "Submit Report"
5. Track status in the feed

---

## Resident Features

### 1. View Apartment Information

**Access**: Left sidebar → "View Apartment"

**Features**:
- View building ID
- Check floor and apartment number
- See monthly fee
- View all members in your apartment
- View contact information of neighbors

### 2. Manage Properties

**Access**: Left sidebar → "View Properties"

**Available Properties Tab**:
- List all your registered properties
- Add new property:
  1. Click "Add Property"
  2. Enter property name
  3. Click "Add"
- Edit property name
- Delete property (if not currently reported missing)

**Vehicle Tab**:
- Register your vehicle:
  1. Click "Register Vehicle"
  2. Enter license plate number
  3. Click "Register"
- View vehicle information
- Update license plate
- Check vehicle entry/exit logs

**Vehicle Access Control**:
1. Navigate to Vehicle tab in Properties
2. View history in the logs section

### 3. Legal Documents

**Access**: Left sidebar → "Legal Documents"

**Features**:
- **Upload Documents**:
  1. Click "Upload Document"
  2. Select PDF file
  3. Wait for upload confirmation
  4. Document appears in your list

- **View Documents**:
  - Click on any document to view
  - PDF viewer opens in browser
  - Navigate and zoom as needed

- **Delete Documents**:
  1. Click "Delete" on any document
  2. Confirm deletion
  3. Document is removed from storage

**Important Notes**:
- Only PDF files are accepted
- Documents are stored securely
- Only you can access your documents

### 4. Property Loss Reports

**Report Missing Property**:
1. From the main feed, click "Report Missing Property"
2. Select the property that's missing
3. Add detailed description
4. Submit the report
5. Track its status in the feed

**Available Properties**:
- Only properties that are "found" or never reported appear in dropdown
- This prevents duplicate reporting

**Status Tracking**:
- **Not Found**: Initial status when reported
- **Found**: When item is recovered
- Admin can update status

---

## Admin Features

### Access Admin Dashboard

**For Administrators Only**

1. Navigate to Admin Dashboard (sidebar)
2. Select view: "Users" or "Apartments"
3. Use management tools

### Manage Users

**View All Users**:
- Complete list of all residents
- Columns: Email, Name, Role, Birth Year, Gender
- Click on any user to edit

**Edit User Information**:
1. Click on user row
2. Edit form appears
3. Modify:
   - Email
   - Full name
   - Role (tenant/admin)
   - Year of birth
   - Gender
   - Apartment assignment
4. Click "Save"

**Add New User**:
1. Click "Add User" button
2. Fill in registration form:
   - Full name (required)
   - Email (required, unique)
   - Password (required)
3. Click "Create Account"
4. User appears in list

**Assign Apartment**:
1. Edit a user
2. In the apartment section, click "Assign to Apartment"
3. Select apartment from dropdown
4. Save changes

**Remove from Apartment**:
1. Edit user
2. Click "Remove from Apartment"
3. Confirm removal
4. User's apartment assignment cleared

### Manage Apartments

**View All Apartments**:
- Complete list of all apartments
- Columns: Building ID, Floor, Apartment Number, Monthly Fee
- Shows member count
- Click on apartment to view details

**Edit Apartment**:
1. Click on apartment row
2. Edit form appears
3. Modify:
   - Building ID
   - Floor
   - Apartment number
   - Monthly fee
4. Click "Update"
5. Click "Show Members" to see residents

**Add New Apartment**:
1. Click "Add Apartment" button
2. Enter details:
   - Building ID
   - Floor number
   - Apartment number
   - Monthly fee
3. Click "Create Apartment"

**View Apartment Members**:
- Click on any apartment
- "Show Members" section lists:
  - User IDs
  - Full names
  - Email addresses
- Track who lives where

**Delete Apartment**:
1. Click "Delete" button
2. Confirm deletion
3. **Warning**: This removes the apartment but keeps users
4. Users' apartment assignments become null

### Property Reports Management

Admins can review and manage property loss reports:
- View all reports in the main feed
- Update report status
- Mark items as found
- Approve claims
- Delete false reports

---

## Tips & Best Practices

### For Residents

1. **Keep Documents Updated**: Regularly upload important legal documents
2. **Report Promptly**: Report missing items as soon as possible
3. **Check Vehicle Logs**: Review entry/exit times regularly
4. **Stay Connected**: Check the community feed for updates
5. **Update Profile**: Keep your contact information current

### For Administrators

1. **Regular Audits**: Review user and apartment data regularly
2. **Handle Reports**: Process property reports promptly
3. **Manage Access**: Assign and update apartment assignments carefully
4. **Monitor Activity**: Check vehicle logs for security
5. **Maintain Accuracy**: Keep apartment information up-to-date

---

## Troubleshooting

### Can't Log In?

- Verify your credentials are correct
- Try using a demo account
- Check your internet connection
- Clear browser cache and cookies

### Upload Failed?

- Ensure file is PDF format
- Check file size (recommended: under 10MB)
- Verify internet connection is stable
- Try again after a few moments

### Can't See My Apartment?

- Contact administrator to assign you to an apartment
- Verify your account is active
- Check if apartment was deleted

### Vehicle Registration Error?

- Verify license plate is unique
- Check if you already have a registered vehicle
- Ensure all fields are filled correctly

### Document Not Displaying?

- Confirm file is PDF format
- Check if file is corrupted
- Try uploading again
- Contact support if issue persists

### Property Report Issues?

- Ensure property is not already reported as missing
- Check if property status was updated to "found"
- Verify you own the property you're trying to report

---

## Support

### Getting Help

- **Technical Issues**: Contact your system administrator
- **Account Issues**: Contact building management
- **Feature Requests**: Submit through official channels

### Contact Information

For assistance, contact your building administrator or support team.

---

## Keyboard Shortcuts

- **Esc**: Close dialogs and modals
- **Enter**: Submit forms (when focused)
- **Tab**: Navigate between fields

---

## Security Reminders

1. **Never share your login credentials**
2. **Log out when using shared computers**
3. **Use strong passwords**
4. **Report suspicious activity immediately**
5. **Keep your account information confidential**

---

## Feature Summary

✅ **Resident Management** - Add, edit, and manage resident information  
✅ **Apartment Lookup** - Search and view apartment details and members  
✅ **Vehicle Tracking** - Register vehicles and track entry/exit  
✅ **Document Storage** - Upload, view, and manage PDF documents  
✅ **Property Reports** - Report and track missing items  
✅ **Community Feed** - Posts and announcements  
✅ **Admin Dashboard** - Complete building management  

---

**Thank you for using the Apartment Management System!**

If you have questions or need assistance, don't hesitate to contact support.

---

**Last Updated**: 2024  
**System Version**: 1.0