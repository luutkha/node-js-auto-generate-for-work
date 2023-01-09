var express = require("express");
var app = express();
//Check log api
var morgan = require("morgan");
app.use(morgan("combined"));
//Multer
const multer = require("multer");
const upload = multer();
// template engine
var exphbs = require("express-handlebars");
app.engine("hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", "hbs");
var _ = require("lodash");
const fs = require("fs").promises;
const path = require("path");
const { text } = require("express");
const { writeFile } = require("./helper/fileHelper");
console.log("START TESTING");
//const
const testFolder =
  "D:\\Works\\3-DAP\\gcr\\apps\\customer-management\\src";
const listFoldersNeedFilter = ["molecules","organisms"];
// const listFoldersNeedFilter = ["atoms", "molecules", "organisms"];

// get all file path on folder
async function walk(dir) {
  let files = await fs.readdir(dir);
  files = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) return walk(filePath);
      else if (stats.isFile()) return filePath;
    })
  );

  return files.reduce((all, folderContents) => all.concat(folderContents), []);
}

async function getComponentName(path) {
  try {
    const data = await fs.readFile(path, { encoding: "utf8" });
    // const regex = /(?<=export default ).*(?=[;*])/g;
    const regex = /(?<=export default ).*/g;
    const finalData = data
      .split("\r")
      .map((text) => text.match(regex))
      .filter((e) => e !== null);

    return _.flatMapDeep(finalData)[0].replace(";", "");
  } catch (err) {
    console.log(err);
  }
}

async function writeStoryBookFile(componentData) {
  const importText = `
  import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import ${componentData.componentName} from './${componentData.fileName}';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: '${(
    path.dirname(componentData.path) +
    "/" +
    componentData.componentName
  )
    .toString()
    .replace("\\", "//")}',
  component: ${componentData.componentName},
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
  },
} as ComponentMeta<typeof ${componentData.componentName}>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ${
    componentData.componentName
  }> = (args) => <${componentData.componentName} {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {}
  `;
  console.log(importText);
  writeFile(
    path.dirname(componentData.path) +
      "\\" +
      componentData.componentName +
      ".stories.tsx",
    importText
  );
}

async function generateStoryFile() {
  const listComponentPath = await walk(testFolder);

  // filter compoents here
  const finalListComponent = [...listComponentPath].filter(
    (p) =>
      (p.includes(".jsx") || p.includes(".tsx") || p.includes(".js")) &&
      listFoldersNeedFilter.filter((f) => p.includes(f)).length > 0
  );
  for (let index = 0; index < finalListComponent.length; index++) {
    // for (let index = 0; index <= 4; index++) {
    const component = finalListComponent[index];
    const componentName = await getComponentName(component);
    if (!componentName) {
      console.log(component);
      continue;
    }
    const fileNameWithType = path.extname(component);
    const fileName = path.basename(component, fileNameWithType);

    const rawData = {
      id: index,
      componentName: componentName,
      path: component,
      fileNameWithType,
      fileName,
      storyContent: undefined,
    };

    //TO DO
    console.log(rawData);
    const data = await writeStoryBookFile(rawData);
  }
}

async function writeIndexFile(data) {
  const baseString = `export { default as ${data.componentName} } from '${data.path.replace('.tsx',"").replace(".jsx","").replace(".js","")}'; \n`;
  return baseString
    .replace(
      "D:\\Works\\3-DAP\\Code\\dap-common-lib\\src\\components\\organisms\\",
      "./"
    )
    .replace("\\", "/");
}
async function generateIndexFile() {
  let finalText = "";
  const listComponentPath = await walk(testFolder);

  // filter compoents here
  const finalListComponent = [...listComponentPath].filter(
    (p) =>
    (p.includes(".jsx") || p.includes(".tsx") || p.includes(".js")) &&
    p.includes(".stories") === false
    );
    console.log(finalListComponent.length);
  for (let index = 0; index < finalListComponent.length; index++) {
    // for (let index = 0; index <= 4; index++) {
    const component = finalListComponent[index];
    const componentName = await getComponentName(component);
    if (!componentName) {
      console.log("undefined", component);
      continue;
    }
    const fileNameWithType = path.extname(component);
    const fileName = path.basename(component, fileNameWithType);

    const rawData = {
      id: index,
      componentName: componentName,
      path: component,
      fileNameWithType,
      fileName,
      storyContent: undefined,
    };

    //TO DO
    console.log(rawData);

    finalText += await writeIndexFile(rawData);
  }
  console.log(finalText);
}
// generateIndexFile();
generateStoryFile()
//=====
console.log("END TESTING");
