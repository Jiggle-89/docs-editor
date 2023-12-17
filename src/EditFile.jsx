import { useState, useEffect } from 'react'
import './index.css'
import './mdxeditor.css'
import '@mdxeditor/editor/style.css'
import { MDXEditor } from '@mdxeditor/editor/MDXEditor'
import { UndoRedo } from '@mdxeditor/editor/plugins/toolbar/components/UndoRedo'
import { BoldItalicUnderlineToggles } from '@mdxeditor/editor/plugins/toolbar/components/BoldItalicUnderlineToggles'
import { InsertTable } from '@mdxeditor/editor/plugins/toolbar/components/InsertTable'
import { BlockTypeSelect } from '@mdxeditor/editor/plugins/toolbar/components/BlockTypeSelect'
import { toolbarPlugin } from '@mdxeditor/editor/plugins/toolbar'
import { tablePlugin } from '@mdxeditor/editor'
import { headingsPlugin } from '@mdxeditor/editor/plugins/headings'
import { listsPlugin } from '@mdxeditor/editor/plugins/lists'
import { thematicBreakPlugin } from '@mdxeditor/editor'
import { linkPlugin } from '@mdxeditor/editor/plugins/link'
import { markdownShortcutPlugin } from '@mdxeditor/editor'
import { frontmatterPlugin } from '@mdxeditor/editor'
import { ListsToggle } from '@mdxeditor/editor'
import {getFirestore, collection, doc, getDoc, setDoc} from 'firebase/firestore'
import app from './firebase'
import {Button} from 'antd'
import {useParams} from 'react-router-dom'
import fetch from 'node-fetch'

// ! github personal access token: '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'
// ? path in firestore is handled like this: pages/path/to/file without .mdx

const db = getFirestore(app);

function EditFile() {
  
  let {name} = useParams()

  const [markdown, setMarkdown] = useState(null)
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    setMarkdown(null);
    fetchFunc({setMarkdown, name});
  }, [name])

  if (markdown === null) {
    return <h1 style={{color: 'black'}}>טוען...</h1>
  }
  else {
    return (
      <>
        <div>
          <MDXEditor markdown={markdown}
            plugins={[toolbarPlugin({
              toolbarContents: () => ( <>  <UndoRedo />  <BlockTypeSelect /> <BoldItalicUnderlineToggles />   <ListsToggle />   <InsertTable />    </>)
            }),

              tablePlugin(),
              headingsPlugin(),
              listsPlugin(),
              thematicBreakPlugin(),
              linkPlugin(), 
              markdownShortcutPlugin(),
              frontmatterPlugin()
            ]}

            className="mdxeditor"
            key={name}
            onChange={e => setMarkdown(e)}
          />
          <Button type="primary" onClick={postChanges} style={{margin: '0 10px 10px 0'}} loading={loading}>שמור</Button>
        </div>
      </>
    )
  }

  async function postChanges() {
    const filesCollection = collection(db, 'files');
    const docRef = doc(filesCollection, name);
    const docSnap = await getDoc(docRef);

    const newFilesCollection = collection(db, 'newFiles');
    const newDocRef = doc(newFilesCollection, name);

    const data = docSnap.data();

    setLoading(true);


    try {
      await setDoc(newDocRef, {
        path: data.path,
        HE: data.HE,
        name: data.name,
        content: markdown,
        status: 'editing'
      })
    }
    catch(error) {
      console.log(error)
    }
    finally {
      setLoading(false);
    }
  }
}

async function fetchFunc({setMarkdown, name}) {

  const data = await fetchPath({name})

  setMarkdown(escapeHtmlAndJsxTags(data.content));
}

async function fetchPath({name}) {
  const filesCollection = collection(db, 'files');

  const docRef = doc(filesCollection, name);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return data;
}

function escapeHtmlAndJsxTags(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default EditFile





// ! async function postChanges() { saving this for admin page
//   // fetch the path from the database according to the name variable that is the document name
//   const data = await fetchPath({name}) // fetches data object {name, HE, content, path}
//   const path = data.path; // extract path from the object

//   fetch('https://git-api-push.vercel.app/update', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ markdown, path }),
//   })
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch((error) => {
//     console.error('Error:', error);
//   });
// }
