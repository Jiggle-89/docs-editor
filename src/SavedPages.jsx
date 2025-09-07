// Firebase imports removed - using localStorage instead

function savedPages(setCachedPages) {
  // Function to load and update the drafts
  const loadDrafts = () => {
    // Get all localStorage keys that start with 'draft_'
    const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('draft_'));
    console.log('SavedPages: Found draft keys:', draftKeys);
    
    // Parse all draft data
    const drafts = draftKeys.map(key => {
      try {
        const draftData = JSON.parse(localStorage.getItem(key));
        console.log(`SavedPages: Parsed draft ${key}:`, draftData);
        return {
          ...draftData,
          id: key // Add the key as an ID for consistency
        };
      } catch (error) {
        console.error(`Error parsing draft ${key}:`, error);
        return null;
      }
    }).filter(draft => draft !== null); // Remove any failed parses
    
    // Sort by timestamp (newest first)
    drafts.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    
    console.log('SavedPages: Final drafts array:', drafts);
    setCachedPages(drafts);
  };

  // Load drafts initially
  loadDrafts();

  // Listen for localStorage changes
  const handleStorageChange = (e) => {
    if (e.key && e.key.startsWith('draft_')) {
      console.log('SavedPages: localStorage changed, reloading drafts');
      loadDrafts();
    }
  };

  // Listen for custom events (for same-tab updates)
  const handleCustomStorageChange = () => {
    console.log('SavedPages: Custom storage change event, reloading drafts');
    loadDrafts();
  };

  // Add event listeners
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('localStorageChanged', handleCustomStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('localStorageChanged', handleCustomStorageChange);
  };
}

export default savedPages;
