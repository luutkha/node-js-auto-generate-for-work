var express = require('express');
var app = express();
//Check log api
var morgan = require('morgan')
app.use(morgan('combined'))
//Multer
const multer = require('multer')
const upload = multer()
// template engine
var exphbs = require('express-handlebars');
app.engine('hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
var _ = require('lodash');
const fs = require('fs').promises;
const path = require('path');
const { text } = require('express');

console.log('START TESTING');
//const
const testFolder = 'D:\\WORK\\WorkOnCompany\\HAS\\Code\\gcr\\libs\\ui\\components\\common\\src';
const listFoldersNeedFilter = ['molecules', 'atoms']

// get all file path on folder
async function walk(dir) {
  let files = await fs.readdir(dir);
  files = await Promise.all(files.map(async file => {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) return walk(filePath);
    else if (stats.isFile()) return filePath;
  }));

  return files.reduce((all, folderContents) => all.concat(folderContents), []);
}

async function getComponentName(path) {
  try {
    const data = await fs.readFile(path, { encoding: 'utf8' });
    const regex = /(?<=export default ).*(?=[;*])/g
    const finalData = data.split('\r').map(text => text.match(regex)).filter(e => e !== null);
    return _.flatMapDeep(finalData)[0]
  } catch (err) {
    console.log(err);
  }
}


async function main() {
  const listComponentPath = await walk(testFolder);

  // filter compoents here
  const finalListComponent = [...listComponentPath].filter(p => (p.includes('.jsx') || p.includes('.tsx')) && listFoldersNeedFilter.filter(f => p.includes(f)).length > 0)
  for (let index = 0; index < finalListComponent.length; index++) {
    const component = finalListComponent[index];
    const componentName = await getComponentName(component);
    if (!componentName) continue;
    const rawData = {
      id: index,
      componentName: componentName,
      path: component,
      storyContent: undefined
    }

    //TO DO
    console.log(rawData)
  }



}
main()
//=====
console.log('END TESTING');