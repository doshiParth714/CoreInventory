const fs = require('fs');
try {
  const content = fs.readFileSync('c:\\\\Users\\\\doshi\\\\OneDrive\\\\Desktop\\\\odoo\\\\CoreInventory - 8 hours.excalidraw', 'utf8');
  const data = JSON.parse(content);
  const texts = data.elements.filter(e => e.type === 'text').map(e => e.text);
  fs.writeFileSync('c:\\\\Users\\\\doshi\\\\OneDrive\\\\Desktop\\\\odoo\\\\core-inventory\\\\extracted_text.txt', texts.join('\\n\\n'));
} catch(e) {
  console.error(e);
}
