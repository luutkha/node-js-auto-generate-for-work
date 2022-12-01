var XLSX = require("xlsx");

module.exports = {
    readOneSheet: function (workbook, sheetName) {
        // console.log(workbook[sheetName]['en'])
        // console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]))
        return (XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]))
    },
    otherMethod: function () { },
};