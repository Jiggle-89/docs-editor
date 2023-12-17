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



function NewPage() {
  const [markdown, setMarkdown] = useState('')

  return (
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
        onChange={e => setMarkdown(e)}
      />
    </div>
  )
}

export default NewPage