// main.mjs

import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import fs from 'node:fs';
import simpleGit from 'simple-git';

// הגדרת נתיבים דינמיים ונכונים
const gitRepoPath = path.join(process.cwd(), '..', '..', 'nextra-docs-template-main', 'docs');
const contentRootPath = gitRepoPath;

console.log('Main: Checking Git repository path:', gitRepoPath);

// בדיקה קריטית: האם התיקייה היא באמת מאגר Git?
let git;
if (!fs.existsSync(path.join(gitRepoPath, '.git'))) {
    console.error(`Warning: The calculated path is not a valid Git repository: ${gitRepoPath}`);
    console.error('Main: Git operations will be disabled. Please check the path in main.mjs.');
    // Don't throw error, just disable Git operations
    git = null;
} else {
    console.log('Main: Git repository found, initializing simple-git...');
    // אתחול simple-git עם הנתיב הנכון למאגר
    git = simpleGit({ baseDir: gitRepoPath });
}


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let viteProcess;

let mainWindow;

const createWindow = (port = 5173) => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  mainWindow.loadURL(`http://localhost:${port}`)
}

app.whenReady().then(() => {
  viteProcess = exec('npm run dev');
  viteProcess.stdout.on('data', (data) => {
    console.log(`[Vite stdout]: ${data}`);
    // Check if Vite is ready and extract the port
    if (data.includes('Local:') && data.includes('http://localhost:')) {
      const portMatch = data.match(/http:\/\/localhost:(\d+)/);
      if (portMatch && portMatch[1]) {
        const port = portMatch[1];
        console.log(`[Main]: Vite is ready on port ${port}`);
        if (!mainWindow) {
          createWindow(port);
        }
      }
    }
  });
  viteProcess.stderr.on('data', (data) => console.error(`[Vite stderr]: ${data}`));
  
  // Fallback: create window after a delay if port detection fails
  setTimeout(() => {
    if (!mainWindow) {
      console.log('[Main]: Fallback - creating window on default port 5173');
      createWindow(5173);
    }
  }, 5000);
})

app.on('will-quit', () => {
  if (viteProcess) {
    console.log('Stopping Vite process...');
    if (process.platform === "win32") {
      exec(`taskkill /PID ${viteProcess.pid} /T /F`);
    } else {
      viteProcess.kill();
    }
    viteProcess = null;
  }
});

// Test handler to verify IPC communication
ipcMain.handle('test-ipc', async () => {
  console.log('Main: Test IPC handler called successfully!');
  return { success: true, message: 'IPC communication is working!' };
});

// ערוץ לקריאת הנתונים
ipcMain.handle('get-sider-content', async () => {
  console.log('Main process: קורא את קבצי הנתונים המקומיים...');
  try {
    const structurePath = path.join(__dirname, 'data', 'structure.json');
    const structureData = JSON.parse(fs.readFileSync(structurePath, 'utf-8'));
    
    const pagesDataPath = path.join(__dirname, 'data', 'pages-data.json');
    const pagesList = JSON.parse(fs.readFileSync(pagesDataPath, 'utf-8'));

    const pagesMap = new Map(pagesList.map(item => [item.name, item]));

    const addHebrewNamesRecursive = (items) => {
      items.forEach((item) => {
        if (pagesMap.has(item.title)) {
          const pageData = pagesMap.get(item.title);
          item.he = pageData.HE;
        }
        if (item.children) {
          addHebrewNamesRecursive(item.children);
        }
      });
    };
    addHebrewNamesRecursive(structureData);
    console.log('Main process: מיזוג הנתונים הושלם. שולח לרנדור.');
    return structureData;
  } catch (error) {
    console.error('Main process: אירעה שגיאה בקריאה או עיבוד של הנתונים המקומיים:', error);
    return { error: error.message };
  }
});

// ערוץ לקבלת תוכן של דף בודד
ipcMain.handle('get-page-content', async (event, pageName) => {
    console.log(`Main process: התקבלה בקשה לתוכן של הדף: ${pageName}`);
    try {
        const pagesDataPath = path.join(__dirname, 'data', 'pages-data.json');
        const pagesList = JSON.parse(fs.readFileSync(pagesDataPath, 'utf-8'));
        const pageData = pagesList.find(p => p.name === pageName);

        if (pageData) {
            console.log(`Main process: נמצא תוכן, מחזיר לרנדור.`);
            return pageData;
        } else {
            console.error(`Main process: לא נמצא דף בשם ${pageName} בקובץ pages-data.json`);
            return { error: `Page with name ${pageName} not found.` };
        }
    } catch (error) {
        console.error(`Main process: אירעה שגיאה בקריאת הקובץ pages-data.json:`, error);
        return { error: error.message };
    }
});


// ערוץ הפרסום עם סדר פעולות Git נכון - מותאם לפי ה-Vercel backend שעבד
ipcMain.handle('publish-changes', async (event, { jsxData, htmlData, newFilePath, name, heText, author, description, createFolder, isNew }) => {
  console.log('Main: ===== PUBLISH-CHANGES HANDLER CALLED =====');
  console.log('Main: התחיל תהליך פרסום שינויים...');
  console.log('Main: Received payload:', { jsxData: !!jsxData, htmlData: !!htmlData, newFilePath, name, heText, author, description, createFolder, isNew });
  

  
  // Check if Git is available
  if (!git) {
    console.error('Main: Git is not available. Cannot perform Git operations.');
    return { success: false, error: 'Git repository not found. Please check the configuration.' };
  }
  
  try {
    console.log('Main: Git repository path:', gitRepoPath);
    console.log('Main: Content root path:', contentRootPath);
    
    // Step 1: Delete deployments branch if it exists (like in Vercel backend)
    console.log('Main: Deleting deployments branch if it exists...');
    try {
      await git.deleteLocalBranch('deployments');
      console.log('Main: Deleted local deployments branch');
    } catch (error) {
      console.log('Main: Deployments branch does not exist locally');
    }
    
    try {
      await git.push('origin', 'deployments', ['--delete']);
      console.log('Main: Deleted remote deployments branch');
    } catch (error) {
      console.log('Main: Remote deployments branch does not exist');
    }

    // Step 2: Create a new branch from 'main' (like in Vercel backend)
    console.log('Main: Creating new deployments branch from main...');
    await git.checkout('main');
    await git.pull('origin', 'main');
    await git.checkoutBranch('deployments', 'main');
    console.log('Main: Created deployments branch from main');

    // Step 3: Write the files (same as before)
    const FILE_PATH = path.join(contentRootPath, `${newFilePath}.mdx`);
    const META_PATH = path.join(contentRootPath, newFilePath.split('/').slice(0, -1).join('/'), '_meta.json');

    console.log('Main: File path to write:', FILE_PATH);
    console.log('Main: Meta path to write:', META_PATH);

    const fileDir = path.dirname(FILE_PATH);
    console.log('Main: Creating directory:', fileDir);
    fs.mkdirSync(fileDir, { recursive: true });

    console.log('Main: Writing file content (first 100 chars):', jsxData.substring(0, 100));
    fs.writeFileSync(FILE_PATH, jsxData, 'utf8');
    console.log(`Main: הקובץ ${FILE_PATH} נשמר.`);
    
    // Verify the file was written
    if (fs.existsSync(FILE_PATH)) {
      const writtenContent = fs.readFileSync(FILE_PATH, 'utf8');
      console.log('Main: File exists and contains', writtenContent.length, 'characters');
    } else {
      console.error('Main: File was not created!');
    }

    // Handle meta file (like in Vercel backend) - for both new and existing pages
    let metaContent = {};
    try {
        if (fs.existsSync(META_PATH)) {
            metaContent = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
            console.log('Main: Loaded existing meta content:', metaContent);
        }
    } catch (e) { 
        console.log('Main: קובץ מטא לא קיים, ניצור אחד חדש.'); 
    }
    
    // Update meta content with the current page info
    metaContent[name] = { "title": heText };
    fs.writeFileSync(META_PATH, JSON.stringify(metaContent, null, 2), 'utf8');
    console.log(`Main: קובץ המטא ${META_PATH} עודכן עם התוכן:`, metaContent);
    
    // Verify the meta file was written
    if (fs.existsSync(META_PATH)) {
      const writtenMetaContent = fs.readFileSync(META_PATH, 'utf8');
      console.log('Main: Meta file exists and contains:', writtenMetaContent);
    } else {
      console.error('Main: Meta file was not created!');
    }

    // Step 4: Update local cache (same as before)
    console.log('Main: מעדכן את קובץ המטמון pages-data.json...');
    const pagesDataPath = path.join(__dirname, 'data', 'pages-data.json');
    const pagesList = JSON.parse(fs.readFileSync(pagesDataPath, 'utf-8'));

    const pageIndex = pagesList.findIndex(p => p.name === name);

    if (isNew && pageIndex === -1) {
        pagesList.push({
            name: name,
            HE: heText,
            path: newFilePath,
            content: jsxData,
            html: htmlData
        });
        console.log(`Main: הדף החדש '${name}' נוסף למטמון.`);
    } else if (pageIndex !== -1) {
        pagesList[pageIndex].content = jsxData;
        pagesList[pageIndex].html = htmlData;
        pagesList[pageIndex].HE = heText;
        console.log(`Main: הדף '${name}' עודכן במטמון.`);
    }

    fs.writeFileSync(pagesDataPath, JSON.stringify(pagesList, null, 2));
    console.log('Main: קובץ המטמון עודכן בהצלחה.');

    // Step 5: Commit and push to deployments branch (like in Vercel backend)
    // Prefer staging using paths relative to the repo root on Windows
    const relFilePath = path.relative(gitRepoPath, FILE_PATH).split(path.sep).join('/');
    const relMetaPath = path.relative(gitRepoPath, META_PATH).split(path.sep).join('/');

    console.log('Main: Adding files to git stage (relative):', [relFilePath, relMetaPath]);
    try {
      await git.add([relFilePath, relMetaPath]);
    } catch (addErr) {
      console.error('Main: Relative add failed, falling back to add .', addErr);
      await git.add('.');
    }

    // Log status before commit to verify changes are detected
    const statusBeforeCommit = await git.status();
    console.log('Main: Git status before commit:', {
      created: statusBeforeCommit.created,
      modified: statusBeforeCommit.modified,
      renamed: statusBeforeCommit.renamed,
      staged: statusBeforeCommit.staged
    });

    if (
      statusBeforeCommit.created.length === 0 &&
      statusBeforeCommit.modified.length === 0 &&
      statusBeforeCommit.renamed.length === 0 &&
      statusBeforeCommit.staged.length === 0
    ) {
      console.log('Main: No changes detected by git, skipping commit/push.');
      return { success: true, message: 'No changes detected. Nothing to commit.' };
    }

    console.log('Main: Committing changes with message:', description || `עדכון תוכן: ${name}`);
    await git.commit(description || `עדכון תוכן: ${name}`);
    console.log('Main: בוצע commit.');

    console.log('Main: Pushing to origin/deployments...');
    await git.push('origin', 'deployments');
    console.log('Main: Pushed to deployments branch');

    // Step 6: Merge deployments into main (like in Vercel backend)
    console.log('Main: Merging deployments into main...');
    await git.checkout('main');
    await git.merge(['deployments']);
    console.log('Main: Merged deployments into main');

    // Step 7: Push main branch
    console.log('Main: Pushing main branch...');
    await git.push('origin', 'main');
    console.log('Main: Pushed main branch');

    // Step 8: Clean up - delete deployments branch
    console.log('Main: Cleaning up deployments branch...');
    try {
      await git.deleteLocalBranch('deployments');
      await git.push('origin', 'deployments', ['--delete']);
      console.log('Main: Cleaned up deployments branch');
    } catch (error) {
      console.log('Main: Error cleaning up deployments branch:', error.message);
    }

    console.log('Main: בוצעה דחיפה ל-Git. התהליך הסתיים בהצלחה!');
    return { success: true, message: '--- NEW CODE CONFIRMED --- השינויים פורסמו בהצלחה!' };

  } catch (error) {
    console.error('Main: אירעה שגיאה בתהליך הפרסום', error);
    return { success: false, error: error.message };
  }
});
