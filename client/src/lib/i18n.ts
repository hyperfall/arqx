// Simple i18n utility (English only for now)
const translations = {
  // Common
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  copy: 'Copy',
  paste: 'Paste',
  import: 'Import',
  export: 'Export',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  
  // Tool actions
  run: 'Run',
  restart: 'Restart',
  stop: 'Stop',
  generate: 'Generate Tool',
  
  // Navigation
  home: 'Home',
  gallery: 'Tool Gallery',
  settings: 'Settings',
  about: 'About',
  
  // Tool page
  'tool.copyLink': 'Copy Link',
  'tool.exportTool': 'Export Tool',
  'tool.importTool': 'Import Tool',
  'tool.undo': 'Undo',
  'tool.redo': 'Redo',
  'tool.runLocally': 'Runs locally • No server needed',
  'tool.serverNeeded': 'Server needed for large files',
  
  // File handling
  'files.dragDrop': 'Drag & drop files here',
  'files.pasteFromClipboard': 'Paste from clipboard',
  'files.selectAll': 'Select all',
  'files.clearAll': 'Clear all',
  'files.removeSelected': 'Remove selected',
  'files.rename': 'Rename pattern',
  'files.preview': 'Preview:',
  
  // Progress
  'progress.estimatedTime': 'Estimated time',
  'progress.processing': 'Processing...',
  'progress.complete': 'Complete',
  'progress.failed': 'Failed',
  
  // Import/Export
  'import.invalidJson': 'Invalid JSON file',
  'import.success': 'Tool imported successfully',
  'import.dragDropJson': 'Drag & drop JSON file or click to browse',
  'export.downloading': 'Downloading tool specification...',
  
  // Command palette
  'palette.search': 'Type a command or search...',
  'palette.recent': 'Recent',
  'palette.actions': 'Actions',
  'palette.navigation': 'Navigation',
  
  // Keyboard shortcuts
  'shortcuts.title': 'Keyboard Shortcuts',
  'shortcuts.search': 'Focus search',
  'shortcuts.submit': 'Submit',
  'shortcuts.newline': 'New line',
  'shortcuts.blur': 'Blur input',
  'shortcuts.toggleRail': 'Toggle navigation',
  'shortcuts.palette': 'Command palette',
  
  // Error messages
  'error.fileTooBig': 'File is too large (max {maxSize})',
  'error.tooManyFiles': 'Too many files (max {maxFiles})',
  'error.unsupportedType': 'Unsupported file type',
  'error.loadingTool': 'Failed to load tool',
  'error.savingTool': 'Failed to save tool',
  
  // Recent tools
  'recent.title': 'Recent Tools',
  'recent.empty': 'No recent tools',
  'recent.loadMore': 'Load more',
  
  // Gallery
  'gallery.title': 'Tool Gallery',
  'gallery.search': 'Search tools...',
  'gallery.filter': 'Filter by category',
  'gallery.sort': 'Sort by',
  'gallery.empty': 'No tools found',
  'gallery.loadMore': 'Load more tools',
  
  // Settings
  'settings.title': 'Settings',
  'settings.theme': 'Theme',
  'settings.localOnlyMode': 'Local-only mode',
  'settings.localOnlyDescription': 'Hide server-dependent features',
  'settings.featureFlags': 'Feature Flags',
  'settings.keyboardShortcuts': 'Keyboard Shortcuts',
  
  // 404 page
  'notFound.title': 'Page Not Found',
  'notFound.description': 'The page you\'re looking for doesn\'t exist.',
  'notFound.goHome': 'Go Home',
  
  // Error boundary
  'errorBoundary.title': 'Something went wrong',
  'errorBoundary.description': 'An unexpected error occurred. Please try refreshing the page.',
  'errorBoundary.retry': 'Try Again',
  'errorBoundary.reportIssue': 'Report Issue',
} as const;

type TranslationKey = keyof typeof translations;

export const t = (key: TranslationKey, interpolations?: Record<string, string | number>): string => {
  let text = translations[key] || key;
  
  if (interpolations) {
    Object.entries(interpolations).forEach(([placeholder, value]) => {
      text = text.replace(`{${placeholder}}`, String(value));
    });
  }
  
  return text;
};

export const useTranslation = () => {
  return { t };
};