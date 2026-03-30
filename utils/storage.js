const fs = require('fs');
const path = require('path');

const baseDirs = [
  path.join(__dirname, '..', 'data'),
  path.join(__dirname, '..', 'public', 'uploads', 'images'),
  path.join(__dirname, '..', 'public', 'uploads', 'videos'),
  path.join(__dirname, '..', 'public', 'outputs')
];

function ensureDirs() {
  baseDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const projectsFile = path.join(__dirname, '..', 'data', 'projects.json');
  const usersFile = path.join(__dirname, '..', 'data', 'users.json');
  if (!fs.existsSync(projectsFile)) fs.writeFileSync(projectsFile, '[]');
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');
}

function readJson(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  ensureDirs,
  readJson,
  writeJson
};
