// General UI Content
// Common text content used across all portals

export const UI_CONTENT = {
  // Form Elements
  forms: {
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minLength: (min: number) => `Must be at least ${min} characters`,
      maxLength: (max: number) => `Must be no more than ${max} characters`,
      passwordMismatch: 'Passwords do not match',
      invalidFormat: 'Invalid format'
    },
    labels: {
      firstName: 'First Name',
      lastName: 'Last Name',
      fullName: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      phone: 'Phone Number',
      organization: 'Organization',
      role: 'Role',
      status: 'Status',
      description: 'Description',
      notes: 'Notes',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      address: 'Address',
      city: 'City',
      state: 'State',
      postcode: 'Postcode',
      country: 'Country'
    },
    placeholders: {
      enterFirstName: 'Enter your first name',
      enterLastName: 'Enter your last name',
      enterEmail: 'Enter your email address',
      enterPassword: 'Enter your password',
      confirmPassword: 'Confirm your password',
      enterPhone: 'Enter your phone number',
      selectRole: 'Select a role',
      selectStatus: 'Select status',
      enterDescription: 'Enter description',
      searchPlaceholder: 'Search...',
      selectDate: 'Select date',
      selectTime: 'Select time'
    }
  },

  // Status and States
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    suspended: 'Suspended',
    verified: 'Verified',
    unverified: 'Unverified',
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
    completed: 'Completed',
    inProgress: 'In Progress',
    cancelled: 'Cancelled'
  },

  // Time and Date
  time: {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    never: 'Never',
    justNow: 'Just now',
    minutesAgo: (minutes: number) => `${minutes}m ago`,
    hoursAgo: (hours: number) => `${hours}h ago`,
    daysAgo: (days: number) => `${days}d ago`,
    weeksAgo: (weeks: number) => `${weeks}w ago`,
    monthsAgo: (months: number) => `${months}mo ago`,
    yearsAgo: (years: number) => `${years}y ago`
  },

  // Actions
  actions: {
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    reset: 'Reset',
    clear: 'Clear',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    duplicate: 'Duplicate',
    share: 'Share',
    print: 'Print',
    refresh: 'Refresh',
    reload: 'Reload',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    continue: 'Continue',
    finish: 'Finish',
    close: 'Close',
    open: 'Open',
    expand: 'Expand',
    collapse: 'Collapse',
    select: 'Select',
    deselect: 'Deselect',
    selectAll: 'Select All',
    clearAll: 'Clear All'
  },

  // Messages
  messages: {
    success: {
      saved: 'Changes saved successfully',
      created: 'Item created successfully',
      updated: 'Item updated successfully',
      deleted: 'Item deleted successfully',
      uploaded: 'File uploaded successfully',
      exported: 'Data exported successfully'
    },
    error: {
      generic: 'Something went wrong. Please try again.',
      networkError: 'Network error. Please check your connection.',
      unauthorized: 'You are not authorized to perform this action.',
      notFound: 'The requested item was not found.',
      validation: 'Please check your input and try again.',
      uploadFailed: 'File upload failed. Please try again.',
      saveFailed: 'Failed to save changes. Please try again.',
      deleteFailed: 'Failed to delete item. Please try again.'
    },
    confirmation: {
      delete: 'Are you sure you want to delete this item?',
      unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
      logout: 'Are you sure you want to logout?',
      cancel: 'Are you sure you want to cancel?',
      reset: 'Are you sure you want to reset all changes?'
    },
    info: {
      noData: 'No data available',
      noResults: 'No results found',
      loading: 'Loading...',
      saving: 'Saving...',
      processing: 'Processing...',
      uploading: 'Uploading...',
      searching: 'Searching...',
      empty: 'This section is empty',
      comingSoon: 'Coming soon!'
    }
  },

  // Navigation
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    support: 'Support',
    about: 'About',
    contact: 'Contact',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    backToDashboard: 'Back to Dashboard',
    goHome: 'Go Home'
  },

  // Table Elements
  table: {
    headers: {
      id: 'ID',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      created: 'Created',
      updated: 'Updated',
      actions: 'Actions'
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      showing: 'Showing',
      to: 'to',
      results: 'results',
      noResults: 'No results to display'
    },
    sorting: {
      sortBy: 'Sort by',
      ascending: 'Ascending',
      descending: 'Descending'
    }
  }
} as const;