import { useState, useEffect } from 'react'
import AWS from 'aws-sdk'
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
import { ListsToggle } from '@mdxeditor/editor'
import {getFirestore, collection, doc, getDoc,getDocs, query, where} from 'firebase/firestore'
import app from './firebase'
import {Button} from 'antd'
import {useParams} from 'react-router-dom'
import {Octokit} from '@octokit/rest'
import fetch from 'node-fetch'

// ! github personal access token: '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'

const db = getFirestore(app);

function EditFile() {
  
  let {name} = useParams()

  const [markdown, setMarkdown] = useState(null)


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
              markdownShortcutPlugin()
            ]}

            className="mdxeditor"
            key={name}
            onChange={e => setMarkdown(e)}
          />
          <Button onClick={postChanges} style={{margin: '0 10px 10px 0'}}>שמור</Button>
        </div>
      </>
    )
  }

  async function postChanges() {

    AWS.config.update({
      region: 'eu-north-1',
      accessKeyId: 'AKIA2BYQG723VBUYL2VQ',
      secretAccessKey: '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'
    }); 
    const lambda = new AWS.Lambda();

    const params = {
      FunctionName: 'gitPush',
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
      Payload: JSON.stringify({
        markdown: markdown,
        name: name
      }),
    };

    lambda.invoke(params, function(error, data) {
      if (error) {
        console.error(JSON.stringify(error));
      } else if (data.Payload) {
        console.log(data.Payload);
      }
    });


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



  // ! this is the old way of doing it, by querying the name variable of all docs
  // const q = query(filesCollection, where("name", "==", name));
  // const querySnapshot = await getDocs(q);
  // let data;
  // querySnapshot.forEach((doc) => {
  //   data = doc.data();
  // });
  // return data;

}

function escapeHtmlAndJsxTags(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function unescapeHtmlAndJsxTags(str) {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\/g, '');
}

function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}


export default EditFile



/* 

const lambda = new AWS.Lambda();

const params = {
  FunctionName: 'your_lambda_function_name',
  InvocationType: 'RequestResponse',
  LogType: 'Tail',
  Payload: JSON.stringify({
    markdown: 'your_markdown_string',
    name: 'your_name_string'
  }),
};

lambda.invoke(params, function(error, data) {
  if (error) {
    console.error(JSON.stringify(error));
  } else if (data.Payload) {
    console.log(data.Payload);
  }
});




*/
