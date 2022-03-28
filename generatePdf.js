//Native imports
const fs = require("fs");
const path = require("path");
const utils = require("util");

//External imports
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const chalk = require("chalk");

//Internal imports
const invoicesDB = require("./db/invoicesDB.json");

const dotenv = require("dotenv");
dotenv.config();


// preparing html template to use Handlebars
const readFile = utils.promisify(fs.readFile);
async function getTemplateHtml() {
    // console.log("Loading template file in memory");
    try {
        const invoicePath = path.resolve("./invoice.html");
        return await readFile(invoicePath, "utf8");
    } catch (err) {
        return Promise.reject("Could not load html template");
    }
}


//generate PDF handlebars & puppeteer
function generatePdf(data) {
    getTemplateHtml().then(async (res) => {
        // Entire html code stored in "res" object

        // Handlebar compiles the html code
        const template = Handlebars.compile(res);

        // Handlebar: html is customized with data from database
        const html = template(data);

        // Puppeteer: html is rendered to pdf and saved locally
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf({
            path: `./invoices/invoice-${data.invoiceNumber}-${data.clientName}.pdf`,
            format: "A4",
        });
        await browser.close();
        console.log('========================================================================');
        console.log(
            `PDF Invoice ` + chalk.white.bold(data.invoiceNumber) + ` generated now to ` + chalk.white.bold(data.clientName) + ' - 🆗'
        );
        //DB update
        data.invoicePdf = true;
        fs.writeFileSync("./db/invoicesDB.json", JSON.stringify(invoicesDB));
        console.log(
            chalk.white.bold(data.invoiceNumber) + " - " + chalk.white.bold(data.clientName) + ` "PDF STATUS" was updated in our database! ` + ' - 🆗'
        );
    });
}




module.exports = { generatePdf };