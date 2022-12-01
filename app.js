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
var fs = require('fs');
const { render } = require('express/lib/response');
const readXlsxFile = require('read-excel-file/node')
var XLSX = require("xlsx");
const { readOneSheet } = require('./helper/excelHelper')
const { writeFile } = require('./helper/fileHelper')
var _ = require('lodash');

//=====

app.get('/', function (req, res) {
  var workbook = XLSX.readFile("./MultiLanguageScreens.xlsx");
  var sheet_name_list = workbook.SheetNames; // SheetNames is an ordered list of the sheets in the workbook
  data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]); //if you have multiple sheets
  console.log(sheet_name_list)
  let listData = []
  for (var key in sheet_name_list) {
    const tempList = readOneSheet(workbook, sheet_name_list[key])
    listData = _.concat(listData, tempList)
  }
  listData = listData.filter(e => e.en && e.vi && e.Prefix && e.en.length > 0)
  console.log(listData.length)
  const contentForWriteEn = {};
  const contentForWriteVi = {};
  for (let index = 0; index < listData.length; index++) {
    const data = listData[index];
    // if (data.Id === 1) {
    //   contentForWrite += "\\" + data["Components | Item"]
    // }
    contentForWriteEn[data.Prefix] = data.en
    contentForWriteVi[data.Prefix] = data.vi
  }
  writeFile('gdc-health-en.json', JSON.stringify(contentForWriteEn))
  writeFile('gdc-health-vi.json', JSON.stringify(contentForWriteVi))
  res.json(listData)
})
app.post('/', upload.fields([]), function (req, res) {
  console.log(req.body)
  res.render('home');
});

app.get('/index', function (req, res) {
  res.send('Hello, index page here!');
});
app.listen(3000, function () {
  console.log('App listening on port 3000!');
});