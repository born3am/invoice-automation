# Invoice Automation

### Built with:

- node.js
- puppeteer
- handlebars
- nodemailer

#### Installation

- Clone the repository
- $ npm install (to install dependencies)
- To make the email sending works you should create a .env file in the root directory and include your gmail email credentials:

EMAIL=your@email.com

PASSWORD=your-password

(you need to enable less security level to work with gmail: https://hotter.io/docs/email-accounts/secure-app-gmail/)


#### Usage

- The file ./db/invoiceDB.json is the database of invoices. It has an array of objects with this structure:
  {
  "invoiceNumber": "INV-0001",
  "invoiceDate": "01.03.2022",
  "invoiceAmount": "€100,00",
  "invoiceStatus": "Paid",
  "invoiceDueDate": "01.04.2022",
  "clientName": "DHL",
  "clientStreet": "DHL Street",
  "clientCity": "DHL City",
  "clientEmail": "dhl-email@dhl.com",
  "invoicePdf": true,
  "invoiceSent": false
  },

- "invoicePdf" and "invoiceSent" are booleans and holds the status if the invoice PDF and the invoice has been sent to the client or not.
- You can change manually the status to test the PDF generation and the email sending.
- To run the application, you need to run the following command:
  ## $ node app.js
