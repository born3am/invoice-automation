//Native imports
const fs = require("fs");
const path = require("path");
const utils = require("util");

//External imports
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const nodemailer = require("nodemailer");

//Internal imports
const invoicesDB = require("./db/invoicesDB.json");

const dotenv = require("dotenv");
dotenv.config();

// preparing to Handlebar
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

//PDF to Email

//iterate over invoices
invoicesDB.forEach((data) => {
  if (data.invoiceSent == true) {
    console.log(
      `${data.clientName} PDF Invoice, number ${data.invoiceNumber} was already generated and Sent.`
    );
  } else {
    async function generatePdf() {
      getTemplateHtml().then(async (res) => {
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
          path: `./invoices/invoice-${data.invoiceNumber}-${data.clientName}.pdf`,
          format: "A4",
        });
        await browser.close();
        console.log(
          `${data.clientName} PDF Invoice, number ${data.invoiceNumber} generated now`
        );
      });
    }

    // Invoke the function and handle DB update
    generatePdf();

    // NODEMAILER
    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    //NODEMAILER
    //Setup email content
    let mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: `Invoice number ${data.invoiceNumber}`,
      text: `Hello ${data.clientName}!`,
      html: `We are sending your invoice number ${data.invoiceNumber}. <br>
       The invoice of ${data.invoiceAmount} is attached.`,
      attachments: [
        {
          // file on disk as an attachment
          filename: `invoice-${data.invoiceNumber}-${data.clientName}.pdf`,
          path: `./invoices/invoice-${data.invoiceNumber}-${data.clientName}.pdf`,
        },
      ],
    };

    //NODEMAILER
    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        data.invoiceSent = true;
        fs.writeFileSync("./db/invoicesDB.json", JSON.stringify(invoicesDB));
        data.invoicePdf = true;
        fs.writeFileSync("./db/invoicesDB.json", JSON.stringify(invoicesDB));
      }
    });
  }
});
