// Local validation functions that check against pages-data.json instead of Firebase

async function checkHeExists(value) { // this function validates if there's a document with the same HE name in the local data
  if (value && value != '') {
    try {
      // Get the local pages data through the main process
      const pagesData = await window.api.getSiderContent();
      
      // Check if any page has the same Hebrew name
      const hasDuplicateHe = pagesData.some(page => {
        if (page.he === value) return true;
        // Also check recursively in children
        if (page.children) {
          return checkChildrenForHe(page.children, value);
        }
        return false;
      });
      
      if (hasDuplicateHe) {
        return Promise.reject(new Error('שם קובץ כבר קיים במערכת'));
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error checking Hebrew name existence:', error);
      return Promise.reject(new Error('שגיאה בבדיקת שם הקובץ'));
    }
  }
}

async function checkDocExists(value) { // this function validates if there's a document with the same document name in the local data
  if (value && value != '') {
    try {
      // Get the local pages data through the main process
      const pagesData = await window.api.getSiderContent();
      
      // Check if any page has the same English name (title)
      const hasDuplicateEn = pagesData.some(page => {
        if (page.title === value) return true;
        // Also check recursively in children
        if (page.children) {
          return checkChildrenForEn(page.children, value);
        }
        return false;
      });
      
      if (hasDuplicateEn) {
        return Promise.reject(new Error('קובץ עם שם זה קיים במערכת'));
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error checking English name existence:', error);
      return Promise.reject(new Error('שגיאה בבדיקת שם הקובץ'));
    }
  }
}

// Helper function to recursively check children for Hebrew name duplicates
function checkChildrenForHe(children, targetHe) {
  return children.some(child => {
    if (child.he === targetHe) return true;
    if (child.children) {
      return checkChildrenForHe(child.children, targetHe);
    }
    return false;
  });
}

// Helper function to recursively check children for English name duplicates
function checkChildrenForEn(children, targetEn) {
  return children.some(child => {
    if (child.title === targetEn) return true;
    if (child.children) {
      return checkChildrenForEn(child.children, targetEn);
    }
    return false;
  });
}

export {checkHeExists, checkDocExists}