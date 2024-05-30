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
import { SimpleUploadAdapter } from '@ckeditor/ckeditor5-upload';
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


const editorConfig =  {
  // protect line breaks from being parsed
  protectedSource: [/\n/g, /<\?[\s\S]*?\?>/g],
  plugins: [Essentials,Table, SimpleUploadAdapter, TextPartLanguage, PasteFromOffice, TableToolbar, Clipboard, TableCaption, TableCellProperties, TableColumnResize,TableProperties, FindAndReplace, Image, LinkImage, ImageInsert, ImageCaption, ImageResize, ImageStyle, ImageToolbar, SourceEditing, List, ListProperties, Paragraph, Alignment, Bold, Italic, Underline, Strikethrough,Subscript, Superscript, Autoformat, Heading, Font],
  language: {textPartLanguage:[{title: 'עברית', languageCode: 'he'}], ui: 'he', content: 'he'},
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
      'findAndReplace',
      'textPartLanguage'
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
  simpleUpload: {
    uploadUrl: 'https://git-api-push.vercel.app/uploadimage'
  }
  // language: 'he',
  // create a class for the editor
  
}

export default editorConfig