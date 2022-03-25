//Native imports
const fs = require("fs");

//External imports
const chalk = require("chalk");

//Internal imports
const invoicesDB = require("./db/invoicesDB.json");
const { generatePdf } = require("./generatePdf.js");
const { sendEmail } = require("./sendEmail.js");

const dotenv = require("dotenv");
dotenv.config();

// main function
function daemonPdfEmail() {
  console.log(chalk.blue.bgWhite("Starting daemon listener"));

  //App listener
  setInterval(() => {
    console.log(chalk.yellowBright("Checking for new invoices..."));

    //filter invoicesDB to get only invoices that are not sent
    const invoicesToSend = invoicesDB.filter(invoice => !invoice.invoicePdf);
    if (invoicesToSend.length > 0) {
      console.log(chalk.blue.bold("Found new invoices to send! "));
    } else {
      console.log(chalk.green("No new invoices to send - 🆗"));
      return;
    }

    //iterate over invoices to be sent
    invoicesToSend.forEach((data) => {
      console.log(`Initiating process to send PDF invoice ` + chalk.white.bold(data.invoiceNumber) + ` to ` + chalk.white.bold(data.clientName) + `...`);

      // Invoke the function and handle DB update
      generatePdf(data);


    });


  }, 3000);
}

// Invoke the main app function
daemonPdfEmail();



