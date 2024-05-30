import {observer} from 'mobx-react'
import { getFirestore, getDoc, getDocs, doc, collection } from 'firebase/firestore'
import {useState, useEffect} from 'react'
import {auth} from './firebase'
import app from './firebase'
import './diffColors.css'


import HtmlDiff from 'htmldiff-js'
import { diffChars } from 'diff';
import editorConfig from './EditorConfig'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic'
import { Bold, Italic, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials'
import { Paragraph } from '@ckeditor/ckeditor5-paragraph'
import { Alignment } from '@ckeditor/ckeditor5-alignment'
import { Autoformat } from '@ckeditor/ckeditor5-autoformat'
import { Heading } from '@ckeditor/ckeditor5-heading'
import { Font } from '@ckeditor/ckeditor5-font';
import { List } from '@ckeditor/ckeditor5-list';
import { ListProperties } from '@ckeditor/ckeditor5-list'
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
// import { Base64UploadAdapter } from '@ckeditor/ckeditor5-upload';
import { Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link'
import { ImageInsert } from '@ckeditor/ckeditor5-image'
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace'
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';
import {
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar
} from '@ckeditor/ckeditor5-table';
import {Markdown} from '@ckeditor/ckeditor5-markdown-gfm'


const db = getFirestore(app)

const Admin = observer(() => { // admin is a function that receives oldContent and newContent (html strings) and shows the difference between them with color

  const [oldContent, setOldContent] = useState(null) // old content of the page
  const [newContent, setNewContent] = useState(null) // new content of the page
  const [result, setResult] = useState(null) // the difference between the old and new content

  const isAdmin = async() => { // check if current user is admin, by reading his own document in the users collection

    if (!auth.currentUser) {
      return false;
    }
    const usersCollection = collection(db, "users");
    const userDoc = doc(usersCollection, auth.currentUser.uid);
    const userDocSnap = await getDoc(userDoc);
    const data = userDocSnap.data();
    return data.isAdmin;
  }


  const config = {
    // protect line breaks from being parsed
    protectedSource: [/\n/g, /<\?[\s\S]*?\?>/g],
    plugins: [Essentials,Table, TextPartLanguage, PasteFromOffice, TableToolbar, TableCaption, TableCellProperties, TableColumnResize,TableProperties, Clipboard, FindAndReplace, Image, LinkImage, ImageInsert, ImageCaption, ImageResize, ImageStyle, ImageToolbar, SourceEditing, List, ListProperties, Paragraph, Alignment, Bold, Italic, Underline, Strikethrough,Subscript, Superscript, Autoformat, Heading, Font],
    // language: {textPartLanguage:[{title: 'Hebrew', languageCode: 'he'}], ui: 'he', content: 'he'},
    toolbar: {
      items: [
        'undo',
        'redo',
        'alignment',
        'sourceEditing',
        '|',
        'heading',
        'fontSize',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'underline',
        'italic',
        'strikethrough',
        '|',
        'numberedList',
        'bulletedList',
        '|',
        'link',
        'insertImage',
        'insertTable',
        '|',
        'findAndReplace'
      ],
      shouldNotGroupWhenFull: true
    },
    heading: {
      options: [
        {model: 'paragraph', title: 'פסקה', class: 'ck-heading_paragraph'},
        {model: 'heading1', view: 'h1', title: 'כותרת 1', class: 'ck-heading_heading1'},
        {model: 'heading2', view: 'h2', title: 'כותרת 2', class: 'ck-heading_heading2'},
        {model: 'heading3', view: 'h3', title: 'כותרת 3', class: 'ck-heading_heading3'},
        {model: 'heading4', view: 'h4', title: 'כותרת 4', class: 'ck-heading_heading4'},
      ]
    },
    fontSize: {
      options: [
        12,
        14,
        16,
        18,
        20,
        22,
        24,
        26,
        28,
        30
      ]
    },
    fontBackgroundColor: {
      colors: [
        {
          color: 'hsl(0, 75%, 60%)',
          label: 'Red'
        },
        {
            color: 'hsl(30, 75%, 60%)',
            label: 'Orange'
        },
        {
            color: 'hsl(60, 100%, 50%)',
            label: 'Yellow'
        },
        {
            color: 'hsl(90, 75%, 60%)',
            label: 'Light green'
        },
        {
            color: 'hsl(120, 75%, 60%)',
            label: 'Green'
        },
      ]
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },
    image: {
      toolbar: [
          'imageStyle:alignRight',
          'imageStyle:block',
          'imageStyle:alignLeft',
          '|',
          'toggleImageCaption',
          '|',
          'linkImage',
          'imageTextAlternative',
      ],
      insert: {
        integrations: ['upload', 'assetManager', 'url'],
        type: 'auto'
      }
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableCellProperties',
        'tableProperties'
      ],
      defaultHeadings: { rows: 1, columns: 1 },
      tableProperties: {
        defaultProperties: {
          width: '400px',
          height: '400px',
          borderStyle: 'solid',
          borderColor: 'rgba(75,85,99)',
          borderWidth: '1px',
          alignment: 'center',
        }
      },

      // tableCellProperties: {S
      //   defaultProperties: {
      //     horizontalAlignment: 'center', 
      //     verticalAlignment: 'middle',
      //     padding: '10px'
      //   }
      // }
    },
    language: 'he',
    // create a class for the editor
  }

  const diffStyle = {
    backgroundColor: 'white',
    color: 'black',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 0 12px 0 rgba(0, 0, 0, 0.12)',
    width: '80%',
    height: '97%',
    overflow: 'auto',
    marginTop: '16px'
  }

  useEffect(() => {
    const fetcher = async() => {
      await compareHtml()
    }
    fetcher()
  }, [])



  return (
    <div style={{display: 'flex', height: '100%', alignItems: 'start', justifyContent: 'center'}}>

      {/* <div style={{width: '30%'}}>
        {oldContent && <CKEditor config={config} disabled editor={ClassicEditor} onReady={editor => editor.setData(oldContent)} />}
      </div>

      <div style={{width: '30%'}}>
        {newContent && <CKEditor config={config} disabled editor={ClassicEditor} onReady={editor => editor.setData(newContent)} />}
      </div> */}

      {/* <div style={{width: '80%'}}>
        {result && <CKEditor config={config} editor={ClassicEditor} onReady={editor => editor.setData(result)} />}
      </div> */}

      <div style={diffStyle} id="diff"></div>

    </div>
  )

  async function fetchOld() {
    const pagesCollection = collection(db, "files");
    const pageDoc = doc(pagesCollection, "milorg");
    const pageDocSnap = await getDoc(pageDoc);
    const data = pageDocSnap.data();
    setOldContent(data.html)
    return data.html
  }

  async function fetchNew() {
    const pagesCollection = collection(db, "newFiles");
    const pageDoc = doc(pagesCollection, "milorg");
    const pageDocSnap = await getDoc(pageDoc);
    const data = pageDocSnap.data();
    setNewContent(data.html);
    return data.html
  }

  // async function compareHtml() {
  //   const old = await fetchOld()
  //   const newHtml = await fetchNew()
  //   const diff = diffChars(old, newHtml);
  //   let result = '';

  //   diff.forEach(part => {
  //     // green for additions, red for deletions
  //     // grey for common parts
  //     const color = part.added ? '#00c853' :
  //       part.removed ? 'red' : 'grey';
  //     const span = `<span style="color: ${color}">${part.value}</span>`;
  //     result += span;
  //   });

  //   setResult(result)

  //   return result;
  // }

  async function compareHtml() {
    const old = await fetchOld()
    const newHtml = await fetchNew()


    const diff = document.getElementById('diff')
    diff.innerHTML = HtmlDiff.execute(old, newHtml)

    // const diffString = HtmlDiff.execute(old, newHtml)
    // setResult(diffString)

    // return diffString
  }


})

export default Admin