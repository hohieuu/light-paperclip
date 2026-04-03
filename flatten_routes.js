const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'server/src/routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let changed = false;

  // Replace route paths
  if (content.includes('"/companies/:companyId/')) {
    content = content.replace(/"\/companies\/:companyId\//g, '"/');
    changed = true;
  }
  if (content.includes('"/companies/:companyId"')) {
    content = content.replace(/"\/companies\/:companyId"/g, '"/"');
    changed = true;
  }

  // Replace req.params.companyId
  if (content.includes('req.params.companyId as string')) {
    content = content.replace(/req\.params\.companyId as string/g, 'GLOBAL_COMPANY_ID');
    changed = true;
  }
  if (content.includes('req.params.companyId')) {
    content = content.replace(/req\.params\.companyId/g, 'GLOBAL_COMPANY_ID');
    changed = true;
  }

  if (changed) {
    // Add import if not present
    if (!content.includes('GLOBAL_COMPANY_ID')) {
      // Should be there because we just replaced it, but just in case
    }
    if (content.includes('GLOBAL_COMPANY_ID') && !content.includes('GLOBAL_COMPANY_ID')) {
        // wait, need to check if imported
    }
    
    // Let's just add the import at the top after the last import
    if (!content.includes('GLOBAL_COMPANY_ID } from "@agilo/shared"')) {
      // Find the @agilo/shared import
      if (content.includes('from "@agilo/shared"')) {
        content = content.replace(/from "@agilo\/shared";/, ', GLOBAL_COMPANY_ID } from "@agilo/shared";');
        // Fix potential syntax errors like `import { something, GLOBAL_COMPANY_ID } from "@agilo/shared";`
        // Actually, it's safer to just add a new import line
        content = 'import { GLOBAL_COMPANY_ID } from "@agilo/shared";\n' + content;
      } else {
        content = 'import { GLOBAL_COMPANY_ID } from "@agilo/shared";\n' + content;
      }
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
