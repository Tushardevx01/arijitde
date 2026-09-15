const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.scripts = {
  ...pkg.scripts,
  "build": "cd backend && npm install && npm run build",
  "start": "cd backend && npm start"
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
