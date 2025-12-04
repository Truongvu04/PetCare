# Design Document

## Overview

This design document outlines the approach for converting all user interface text from Vietnamese to English in the pet care application. The solution will systematically replace all Vietnamese text strings with English equivalents while preserving all existing functionality, event handlers, API calls, and application logic.

## Architecture

### Translation Approach

The translation will follow a **direct string replacement** strategy:
- Identify all Vietnamese text strings in JSX components
- Replace with English equivalents
- Maintain all JavaScript logic, event handlers, and state management
- Preserve all className, styling, and layout structures

### Component Organization

The application is organized into the following main component categories:
1. **Authentication Components** - Login, Register, Role Selection
2. **Dashboard Components** - Pet Owner, Vendor, Admin dashboards
3. **Pet Management Components** - Add Pet, Edit Pet, View Pet Profile
4. **Health Tracking Components** - Health Notes, Vaccinations, Weight Tracking
5. **Shopping Components** - Shop, Cart, Checkout, Orders
6. **Vendor Components** - Product Management, Order Management, Coupon Management
7. **Admin Components** - Admin Dashboard, Coupon Management
8. **Calendar & Reminder Components** - Calendar, Events, Reminders
9. **Map Components** - Veterinary Map, Location Search
10. **Common Components** - Navigation, Settings, Notifications

## Components and Interfaces

### Translation Mapping Structure

Each component will have its text content translated according to these categories:

#### 1. Navigation and Menu Items
- Vietnamese → English mapping for all menu labels
- Sidebar navigation items
- Breadcrumb navigation

#### 2. Form Elements
- Input labels and placeholders
- Button text (Submit, Cancel, Save, Delete, etc.)
- Validation messages
- Helper text

#### 3. Status Labels
- Order status (Pending, Processing, Shipped, Delivered, Cancelled)
- Payment status (Paid, Unpaid, Refunded)
- Product status (Active, Inactive, Out of Stock)

#### 4. Messages and Notifications
- Success messages
- Error messages
- Warning messages
- Confirmation dialogs

#### 5. Data Display
- Table headers
- Column names
- Empty state messages
- Loading messages

## Data Models

### Translation Dictionary Structure

```javascript
const translations = {
  // Authentication
  "Đăng nhập": "Login",
  "Đăng ký": "Register",
  "Đăng xuất": "Logout",
  
  // Common Actions
  "Thêm mới": "Add New",
  "Sửa": "Edit",
  "Xóa": "Delete",
  "Lưu": "Save",
  "Hủy": "Cancel",
  "Tìm kiếm": "Search",
  
  // Status
  "Chờ xử lý": "Pending",
  "Đang xử lý": "Processing",
  "Đang giao hàng": "Shipping",
  "Giao thành công": "Delivered",
  "Đã hủy": "Cancelled",
  
  // Forms
  "Tên": "Name",
  "Email": "Email",
  "Mật khẩu": "Password",
  "Số điện thoại": "Phone Number",
  "Địa chỉ": "Address"
}
```

### Component File Structure

No structural changes to component files:
- File names remain unchanged
- Import statements remain unchanged
- Component logic remains unchanged
- Only JSX text content is modified

## Error Handling

### Translation Verification

1. **Syntax Verification**: Ensure all JSX syntax remains valid after translation
2. **String Interpolation**: Preserve all template literals and variable interpolations
3. **Conditional Rendering**: Maintain all conditional logic for text display
4. **Event Handlers**: Verify no event handlers are accidentally modified

### Fallback Strategy

If any component fails after translation:
1. Verify the original Vietnamese text was correctly identified
2. Check for accidental modification of JavaScript code
3. Ensure all quotes and brackets are properly closed
4. Test the component in isolation

## Testing Strategy

### Manual Testing Approach

Since this is a UI text replacement task, testing will focus on:

1. **Visual Verification**: Review each page to ensure text is in English
2. **Functionality Testing**: Verify all buttons, forms, and interactions work correctly
3. **Responsive Testing**: Ensure text fits properly in all screen sizes
4. **Cross-Component Testing**: Verify navigation between pages works correctly

### Test Coverage Areas

1. **Authentication Flow**
   - Login page displays English text
   - Registration form shows English labels
   - Error messages appear in English

2. **Pet Management**
   - Pet list displays English headers
   - Add/Edit pet forms show English labels
   - Pet profile displays English field names

3. **Health Tracking**
   - Health tracking interface shows English labels
   - Form inputs have English placeholders
   - Health records display English descriptions

4. **Shopping Features**
   - Product listings show English text
   - Cart displays English labels
   - Checkout process uses English text
   - Order history shows English status labels

5. **Vendor Features**
   - Vendor dashboard displays English menu items
   - Product management shows English labels
   - Order management displays English status
   - Coupon management uses English text

6. **Admin Features**
   - Admin dashboard shows English navigation
   - Management interfaces display English labels

7. **Calendar & Reminders**
   - Calendar displays English month/day names
   - Event forms show English labels
   - Reminder notifications appear in English

### Testing Tools

- Browser DevTools for visual inspection
- Manual click-through testing for functionality
- Responsive design testing across devices

## Implementation Strategy

### Phase 1: Core Components (High Priority)
- Authentication components (Login, Register)
- Main navigation and layout components
- Dashboard components

### Phase 2: Feature Components (Medium Priority)
- Pet management components
- Health tracking components
- Shopping and cart components

### Phase 3: Vendor & Admin Components (Medium Priority)
- Vendor dashboard and management
- Admin dashboard and management

### Phase 4: Supporting Components (Lower Priority)
- Calendar and reminder components
- Map and location components
- Settings and profile components

### Translation Process Per Component

For each component file:
1. Open the component file
2. Identify all Vietnamese text strings in JSX
3. Replace with English equivalents
4. Verify no JavaScript logic is modified
5. Save the file
6. Visually test the component

### Quality Assurance

- Each translated component should be tested immediately
- Maintain a checklist of completed components
- Document any issues encountered during translation
- Ensure consistent terminology across all components
