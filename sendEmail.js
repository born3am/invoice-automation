
//Native imports
const fs = require("fs");

//External imports
const nodemailer = require("nodemailer");
const chalk = require("chalk");

//Internal imports
const invoicesDB = require("./db/invoicesDB.json");

//send email using nodemailer
function sendEmail(data) {
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
                Your PaketConcierge Team <br><br>
                
                <img style="width:150px;" src="cid:logo"/>                
                `,
    };

    //NODEMAILER
    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('========================================================================');
            console.log(
                `Email sent "now" to ` + chalk.white.bold(data.clientName) + ` at ` + chalk.white.bold(data.clientEmail) + ' - 🆗'

                // `Email sent to ${data.clientName} at ${data.clientEmail} with info: ${info.response}`
            );
            //DB update
            data.invoiceSent = true;
            fs.writeFileSync("./db/invoicesDB.json", JSON.stringify(invoicesDB));

            console.log(
                chalk.white.bold(data.invoiceNumber) + " - " + chalk.white.bold(data.clientName) + ` "EMAIL STATUS" was updated in our database! ` + ' - 🆗'
            );

        }
    });
}

module.exports = { sendEmail };