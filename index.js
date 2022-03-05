//Native imports
const fs = require("fs");
const path = require("path");
const utils = require("util");

//External imports
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

//Internal imports
const invoicesDB = require("./db/invoicesDB.json");

const readFile = utils.promisify(fs.readFile);
async function getTemplateHtml() {
  console.log("Loading template file in memory");
  try {
    const invoicePath = path.resolve("./invoice.html");
    return await readFile(invoicePath, "utf8");
  } catch (err) {
    return Promise.reject("Could not load html template");
  }
}

//PDF generator

//iterate over invoices
invoicesDB.forEach((data) => {
  if (data.invoicePdf == true) {
    console.log(
      `${data.clientName} PDF Invoice, number ${data.invoiceNumber} was already generated.`
    );
  } else {
    async function generatePdf() {
      getTemplateHtml()
        .then(async (res) => {
          // Entire html code stored in "res" object
          //   console.log(res)

          // Handlebar compiles the html code
          const template = Handlebars.compile(res);

          // Handlebar: html is customized with data from database
          const html = template(data);

          // Puppeteer: html is rendered to pdf and saved locally
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.setContent(html);
          await page.pdf({
            path: `./invoices/invoice-${Date.now()}.pdf`,
            format: "A4",
          });
          await browser.close();
          console.log(
            `${data.clientName} PDF Invoice, number ${data.invoiceNumber} generated now`
          );
        })
        .catch((err) => {
          console.error(err);
        });
    }

    // Invoke the function and handle DB update
    generatePdf()
      //   .then(() => {
      //     data.invoicePdf = true;
      //     fs.writeFileSync("./db/invoicesDB.json", JSON.stringify(invoicesDB));
      //   })
      .catch((err) => {
        console.error(err);
      });
  }
});
