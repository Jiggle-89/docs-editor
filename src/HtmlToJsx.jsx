function htmlToJsx(htmlString) {
  // Convert style attributes to JSX style objects
  let jsxString = htmlString.replace(/style="([^"]*)"/g, (match, group) => {
    const styles = group.split(';').reduce((styleObj, styleProp) => {
      const [property, value] = styleProp.split(':');
      if (!property || !value) return styleObj;

      const formattedProperty = property.trim().replace(/-./g, c => c.substr(1).toUpperCase());
      styleObj[formattedProperty] = value.trim();
      return styleObj;
    }, {});

    // Convert the style object to a string, but without quotes around the keys
    const styleString = Object.entries(styles).map(([key, value]) => `${key}: "${value}"`).join(', ');

    return `style={{${styleString}}}`;
  });

  // Convert class attributes to className
  jsxString = jsxString.replace(/class="/g, 'className="');

  // Add closing tag for img (jsx requires that)
  jsxString = jsxString.replace(/<img([^>]+)>/g, '<img$1 />');

  // Add closing tag for col (jsx requires that)
  jsxString = jsxString.replace(/<col\b([^>]+)>/g, '<col$1 />');

  // replace rowspan with rowSpan and colspan with colSpan
  jsxString = jsxString.replace(/rowspan/g, 'rowSpan');
  jsxString = jsxString.replace(/colspan/g, 'colSpan');
  jsxString = jsxString.replace(/br/g, 'br /');

  // Convert headings to Markdown format (like strong italicize strikethrough etc)
  for (let i = 1; i <= 6; i++) {
    // eslint-disable-next-line no-useless-escape 
    const regex = new RegExp(`<h${i}[^>]*>((<span[^>]*>)?(<i>)?(<s>)?(<strong>)?(<u>)?)(.*?)(<\/u>)?(<\/strong>)?(<\/s>)?(<\/i>)?(<\/span>)?<\/h${i}>`, 'g');
    jsxString = jsxString.replace(regex, ` \n ${'#'.repeat(i)} $7 \n`);
  }

  // Remove span tags that are under headings

  // Replace <p>&nbsp;</p> with a newline
  jsxString = jsxString.replace(/<p>(\s*&nbsp;\s*| nbsp; )<\/p>/g, ' \n');

  jsxString = jsxString.trim();

  
  //! after ending tag of any element insert a line break \n
  //! jsxString = jsxString.replace(/<\/\w+>/g, (match) => `${match}\n`);

  return jsxString;
}

export default htmlToJsx;