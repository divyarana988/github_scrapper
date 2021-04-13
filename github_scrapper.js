let url = "https://github.com/topics";

let request = require("request");
let cheerio = require("cheerio");
let path = require("path");
let fs = require("fs");
let PDFDocument = require("pdfkit");


request(url, cb);
function cb(err, resp, html) {
    if (err) {
        console.log(err);
    } else {
        extractHtml(html);
    }
}

function extractHtml(html) {
    let selectorTool = cheerio.load(html);
    let topicArr = selectorTool(".col-12.col-sm-6.col-md-4.mb-4 a");
    
    for (let i = 0; i < topicArr.length; i++){
        let link = selectorTool(topicArr[i]).attr("href");
        let fullLink = "https://github.com" + link;
        processRepoPage(fullLink);
    }
}

function processRepoPage(fullLink) {
    request(fullLink, cb2);
    function cb2(err, resp, html) {
        if (err) {
            console.log(err);
        } else {
            getRepoLinks(html);
        }
    }
}

function getRepoLinks(html) {
    let selectorTool = cheerio.load(html);
    let topicNameelem = selectorTool(".h1-mktg");
    let arr = selectorTool("a.text-bold");
    console.log(topicNameelem.text());
    let topicName = topicNameelem.text().trim();
    dirCreater(topicName);
    for (let i = 0; i < 8; i++){
        let links = selectorTool(arr[i]).attr("href");
        //console.log(links);
        let reponame = links.split("/").pop();
        let repoName = reponame.trim();
        console.log(repoName);
        //createFile(repoName, topicName);
        let fullLinks = "https://github.com" + links + "/issues";
        getIssues(repoName, topicName, fullLinks);
    }

    console.log("****************************");
}

function dirCreater(topicName) {
    let pathOfFolder = path.join(__dirname, topicName);
    if (fs.existsSync(pathOfFolder) == false) {
        fs.mkdirSync(pathOfFolder);
    }
}

function createFile(repoName, topicName) {
    let pathOfFile = path.join(__dirname, topicName, repoName + ".json");
    if (fs.existsSync(pathOfFile) == false) {
        let createStream = fs.createWriteStream(pathOfFile);
         createStream.end();
    }
}

function getIssues(repoName, topicName, links) {
    request(links, cb2);
    function cb2(err, resp, html) {
        if (err) {
            console.log(err);
        } else {
            extractIssues(html, repoName, topicName);
        }
    }
}

function extractIssues(html, repoName, topicName){
     let selectorTool = cheerio.load(html);
    let issueAnchor = selectorTool("a.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
    let arr = [];
    for (let i = 0; i < issueAnchor.length; i++){
        let name = selectorTool(issueAnchor[i]).text();
        let link = selectorTool(issueAnchor[i]).attr("href");

        arr.push({
            name: name,
            link: "https://github.com" + link
        });
    }
 
    let filePath = path.join(__dirname, topicName, repoName + ".pdf");
    let pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.text(JSON.stringify(arr));
    pdfDoc.end();
//    console.table(arr);
}