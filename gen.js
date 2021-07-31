// index.js
const fs = require('fs');
const path = require('path');
const Handlebars = require("handlebars");

console.log("Reading json data from ", process.argv[2]);

const inputJSON = require(process.argv[2]).versionsList;

const obj = prepareData(inputJSON);

console.log(JSON.stringify(obj, null, 2));
// return;

const html = buildHtml(obj);

console.log(html);

function buildHtml(input) {
    const template = fs.readFileSync(path.resolve(path.join(__dirname, 'index.html.hbs')), "utf-8");
    const renderTemplate = Handlebars.compile(template);
    // console.log(fileData);
    const html = renderTemplate(input);
    // Write to build folder. Copy the built file and deploy
    fs.writeFile("./dist/index.html", html, err => {
        if (err) console.log(err);
        console.log("File written succesfully");
    });

    return html;
}

function prepareData(input) {
    return input.reduce((acc, item) => {
        acc[item.category] = acc[item.category] || { 
            name: item.category, 
            versions: {},
        };

        acc[item.category].versions[item.version] = acc[item.category].versions[item.version] || [];

        acc[item.category].versions[item.version].push({ name: item.name, filename: item.filename, version: item.version, checksum: item.checksum });

        return acc;
    }, {});

    return input;
}

// cat
// version