//Native imports
const fs = require("fs");
const path = require("path");
const utils = require("util");

//External imports
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const nodemailer = require("nodemailer");
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

// main function
function daemonPdfEmail() {
  console.log(chalk.blue.bgWhite("Starting daemon listener"));

  //App listener
  setInterval(() => {
    console.log(chalk.yellowBright("Checking for new invoices..."));

    //filter invoicesDB to get only invoices that are not sent
    const invoicesToSend = invoicesDB.filter(invoice => !invoice.invoiceSent);
    if (invoicesToSend.length > 0) {
      console.log(chalk.blue.bold("Found new invoices to send! "));
    } else {
      console.log(chalk.green("No new invoices to send - 🆗"));
      return;
    }

    //iterate over invoices to be sent
    invoicesToSend.forEach((data) => {
      console.log(`Initiating process to send PDF invoice ` + chalk.white.bold(data.invoiceNumber) + ` to ` + chalk.white.bold(data.clientName) + `...`);

      //generate PDF handlebars & puppeteer
      function generatePdf() {
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
          console.log(
            `PDF Invoice ` + chalk.white.bold(data.invoiceNumber) + ` generated now to ` + chalk.white.bold(data.clientName) + ' - 🆗'
          );
        });
      }

      //send email using nodemailer
      function sendEmail() {
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
          to: data.clientEmail,
          subject: `Invoice number ${data.invoiceNumber} - ${data.clientName}`,

          attachments: [
            {
              // file on disk as an attachment
              filename: `invoice-${data.invoiceNumber}-${data.clientName}.pdf`,
              path: `./invoices/invoice-${data.invoiceNumber}-${data.clientName}.pdf`,
            },
            {
              filename: "logo.png",
              path: "./img/logo.png",
              cid: "logo", //same cid value as in the html img src
            },
          ],

          html: `Dear <strong> ${data.clientName} </strong> Team,<br><br>
                Attached to this email we are sending your invoice number <strong> ${data.invoiceNumber} </strong>, from <strong> ${data.invoiceDate} </strong>. <br><br>
                The amount to be paid until <strong> ${data.invoiceDueDate} </strong> is <strong> ${data.invoiceAmount} </strong>. <br><br><br>
                Thank you for business with us!  <br><br>
                Best regards, <br>
                Your PaketCouncierge Team <br><br>
                
                <img style="width:150px;" src="cid:logo"/>                
                `,
        };

        //NODEMAILER
        // Send email
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log(
              `Email sent "now" to ` + chalk.white.bold(data.clientName) + ` at ` + chalk.white.bold(data.clientEmail) + ' - 🆗'

              // `Email sent to ${data.clientName} at ${data.clientEmail} with info: ${info.response}`
            );
            data.invoiceSent = true;
            fs.writeFileSync("./db/invoicesDB.json", JSON.stringify(invoicesDB));

            data.invoicePdf = true;
            fs.writeFileSync("./db/invoicesDB.json", JSON.stringify(invoicesDB));
          }
        });
      }
      // Invoke the function and handle DB update
      generatePdf();
      sendEmail();
    });
  }, 3000);
}

// Invoke the main app function
daemonPdfEmail();



