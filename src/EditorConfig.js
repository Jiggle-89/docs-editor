// Add individual essential plugins + additional features
import { 
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  Undo,
  Alignment,
  Font,
  SourceEditing,
  FindAndReplace
} from 'ckeditor5';


const editorConfig =  {
  // License key - required for new installation method
  // Use 'GPL' for open source projects that comply with GPL license
  licenseKey: 'GPL',
  // Include only the essential plugins that ClassicEditor needs
  plugins: [
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    List,
    Link,
    Undo,
    Alignment,
    Font,
    SourceEditing,
    FindAndReplace
  ],
  // Plugins array - required for new installation method
  // protect line breaks from being parsed
  protectedSource: [/\n/g, /<\?[\s\S]*?\?>/g],
  language: {textPartLanguage:[{title: 'עברית', languageCode: 'he'}], ui: 'he', content: 'he'},
  toolbar: {
    items: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'numberedList',
      'bulletedList',
      '|',
      'link',
      '|',
      'sourceEditing',
      'findAndReplace',
      '|',
      'alignment',
      'fontSize',
      'fontColor'
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

export default editorConfig;