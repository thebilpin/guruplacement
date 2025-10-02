# Form Styling Standards - PlacementGuru

## ⚠️ CRITICAL: DO NOT MODIFY FORM STYLING WITHOUT READING THIS DOCUMENT

This document defines the standardized form styling system for PlacementGuru to ensure consistent visual presentation across all forms and prevent styling regressions.

## 🎨 Standardized CSS Classes

All forms must use these predefined CSS classes (defined in `src/app/globals.css`):

### Form Container Classes
```css
.form-container
/* Used for main form containers */
/* Applies: border border-gray-200 rounded-lg p-6 bg-white space-y-6 */

.form-section  
/* Used for individual form sections */
/* Applies: border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2 */

.form-input-bordered
/* Used for all input fields, textareas, and select triggers */
/* Applies: border-gray-300 */
```

### Information Display Classes
```css
.form-info-section
/* Used for general information displays */
/* Applies: border border-gray-200 rounded-lg p-4 bg-gray-50 */

.form-success-section
/* Used for success/positive information */
/* Applies: border border-green-200 rounded-lg p-4 bg-green-50 */

.form-warning-section
/* Used for warning information */
/* Applies: border border-yellow-200 rounded-lg p-4 bg-yellow-50 */

.form-error-section
/* Used for error information */
/* Applies: border border-red-200 rounded-lg p-4 bg-red-50 */
```

## 📋 Implementation Requirements

### ✅ REQUIRED Form Structure

```tsx
// Main form container
<form onSubmit={handleSubmit} className="form-container">
  
  {/* Each logical form section */}
  <div className="form-section">
    <Label htmlFor="field">Field Name</Label>
    <Input 
      id="field"
      className="form-input-bordered"
      // ... other props
    />
  </div>
  
  {/* Grid sections */}
  <div className="form-section grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>Field 1</Label>
      <Select>
        <SelectTrigger className="form-input-bordered">
          <SelectValue />
        </SelectTrigger>
      </Select>
    </div>
  </div>
  
  {/* Information displays */}
  <div className="form-info-section">
    <h4>Information Title</h4>
    <p>Information content...</p>
  </div>
  
</form>
```

### 🚫 FORBIDDEN Patterns

**NEVER use these patterns:**
```tsx
// ❌ DON'T: Inline border styles
<form className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">

// ❌ DON'T: Individual border classes
<div className="border border-gray-200 rounded-lg p-4 bg-gray-50">

// ❌ DON'T: Inconsistent input styling
<Input className="border-gray-300" />
```

**ALWAYS use these patterns:**
```tsx
// ✅ DO: Standardized classes
<form className="form-container">
<div className="form-section">
<Input className="form-input-bordered" />
```

## 🔍 Form Components That Use This System

1. **CreateTicketModal** (`src/components/create-ticket-modal.tsx`)
   - Main ticket creation form
   - User search section
   - All form fields use standardized classes

2. **TicketManagementModal** (`src/components/ticket-management-modal.tsx`)
   - Ticket editing/management form
   - Status and priority updates
   - Assignment and internal notes

3. **TicketDetailModal** (`src/components/ticket-detail-modal.tsx`)
   - Comment input field
   - Uses form-input-bordered for textarea

## 🛠️ Maintenance Guidelines

### Before Making Changes
1. **Read this document completely**
2. **Check if standardized classes meet your needs**
3. **If new styles needed, add to globals.css first**
4. **Update this documentation**

### When Adding New Forms
1. **Use `form-container` for main form wrapper**
2. **Group related fields in `form-section` divs**
3. **Apply `form-input-bordered` to all inputs**
4. **Use appropriate info section classes for displays**

### Code Review Checklist
- [ ] Form uses `form-container` class
- [ ] Sections use `form-section` class  
- [ ] All inputs have `form-input-bordered` class
- [ ] No inline border styling
- [ ] Consistent with other forms in codebase

## 🚨 Breaking Changes Warning

**NEVER REMOVE OR MODIFY THESE CLASSES IN `globals.css`:**
- `.form-container`
- `.form-section` 
- `.form-input-bordered`
- `.form-info-section`
- `.form-success-section`
- `.form-warning-section`
- `.form-error-section`

Removing or changing these classes will break styling across the entire application.

## 💡 Benefits of This System

1. **Consistency**: All forms look identical across the app
2. **Maintainability**: Single source of truth for form styling
3. **Scalability**: Easy to add new forms with consistent appearance
4. **Debugging**: Clear class names make issues easy to identify
5. **Performance**: CSS is reused instead of duplicated

## 📞 Support

If you need to modify form styling:
1. Check if existing classes can be extended
2. Add new classes to globals.css if needed
3. Update this documentation
4. Test across all existing forms
5. Update component examples above

---
**Last Updated**: September 27, 2025  
**Maintained By**: Development Team  
**Related Files**: `src/app/globals.css`, all form components