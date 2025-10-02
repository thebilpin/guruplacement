# Content Management System

This application now uses a centralized content management system to eliminate hardcoded strings and enable easy customization and internationalization.

## Structure

### `/src/lib/content/`
- `app-config.ts` - Application branding and configuration
- `admin-content.ts` - All admin portal text content
- `ui-content.ts` - Common UI elements and messages
- `index.ts` - Central export and utility functions

## Key Features

### 🏷️ **No More Hardcoded Strings**
All user-facing text is now managed through content constants:
- Page titles and descriptions
- Button labels and form fields
- Status messages and notifications
- Navigation menu items
- Error and success messages

### 🎨 **Easy Rebranding**
Change your app's branding by updating environment variables:
```bash
NEXT_PUBLIC_APP_NAME="YourBrandName"
NEXT_PUBLIC_SUPPORT_EMAIL="support@yourdomain.com"
NEXT_PUBLIC_ADMIN_EMAIL="admin@yourdomain.com"
```

### 🔧 **Centralized Configuration**
- Feature flags to enable/disable functionality
- Default user settings
- Portal configurations
- Contact information

### 🌐 **Internationalization Ready**
The structure is designed to easily support multiple languages by:
- Separating content from components
- Using function-based dynamic content
- Providing utility functions for formatting

## Usage Examples

### Basic Content Access
```typescript
import { ADMIN_CONTENT } from '@/lib/content';

// Simple text
<h1>{ADMIN_CONTENT.dashboard.title}</h1>

// Dynamic content
<p>{ADMIN_CONTENT.dashboard.kpis.totalUsers.description(count)}</p>
```

### Configuration Access
```typescript
import { APP_CONFIG } from '@/lib/content';

// Brand information
<h1>{APP_CONFIG.brand.name}</h1>
<p>Contact: {APP_CONFIG.brand.supportEmail}</p>

// Feature flags
{APP_CONFIG.features.enableAnalytics && <AnalyticsComponent />}
```

### Utility Functions
```typescript
import { getContent } from '@/lib/content';

// Role formatting
const displayName = getContent.getRoleDisplayName('admin');

// Time formatting  
const timeAgo = getContent.formatTimeAgo(lastLogin);
```

## What's Been Updated

### ✅ **Admin Layout & Navigation**
- All menu items and labels
- Search placeholders
- Profile modal content
- Notification messages
- Logout confirmation

### ✅ **Dashboard Pages**
- Page titles and descriptions
- KPI card labels
- Chart titles
- Export buttons
- Verification statuses

### ✅ **Analytics Dashboard**
- Chart titles and descriptions
- Category labels
- Export functionality

### ✅ **User Management**
- Role display names
- Status formatting
- Time/date formatting
- Table headers

### ✅ **Announcements**
- Status badges
- Validation messages
- Form labels

### ✅ **Integrations**
- Section titles
- Button labels
- Table headers
- Status messages

## Adding New Content

### 1. Add to Content Files
```typescript
// In admin-content.ts
export const ADMIN_CONTENT = {
  newSection: {
    title: 'New Section',
    description: 'Section description',
    buttons: {
      save: 'Save Changes'
    }
  }
  // ... existing content
}
```

### 2. Use in Components
```typescript
import { ADMIN_CONTENT } from '@/lib/content';

function NewComponent() {
  return (
    <div>
      <h1>{ADMIN_CONTENT.newSection.title}</h1>
      <p>{ADMIN_CONTENT.newSection.description}</p>
      <button>{ADMIN_CONTENT.newSection.buttons.save}</button>
    </div>
  );
}
```

## Migration Benefits

### Before (Hardcoded)
```typescript
<h1>Admin Dashboard</h1>
<p>A high-level overview of the entire platform.</p>
<button>Export Summary</button>
```

### After (Content Management)
```typescript
<h1>{ADMIN_CONTENT.dashboard.title}</h1>
<p>{ADMIN_CONTENT.dashboard.description}</p>
<button>{ADMIN_CONTENT.dashboard.exportButton}</button>
```

## Future Enhancements

### 🌍 **Multi-language Support**
Easy to add by creating language-specific content files:
- `admin-content.en.ts`
- `admin-content.es.ts`
- `admin-content.fr.ts`

### 🎛️ **Dynamic Content Management**
Could be extended to load content from:
- Database
- CMS
- External API
- User preferences

### 🔍 **Content Validation**
Add TypeScript types to ensure all required content is provided and properly formatted.

## Best Practices

1. **Always use content constants** instead of hardcoded strings
2. **Group related content** logically in the content files
3. **Use descriptive keys** that make the content's purpose clear
4. **Provide fallbacks** for dynamic content
5. **Test with different content lengths** to ensure UI flexibility

The content management system makes your application more maintainable, customizable, and ready for internationalization!