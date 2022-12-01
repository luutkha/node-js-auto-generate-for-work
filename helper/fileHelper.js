var fs = require('fs');

module.exports = {
    writeFile: function (fileName, content) {
        fs.writeFile(fileName, content, (err) => {
            if (err)
                console.log(err);
            else {
                console.log(fs.readFileSync(fileName, "utf8"));
            }
        });
    },
    otherMethod: function () { },
};