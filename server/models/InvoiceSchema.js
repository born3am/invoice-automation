const mongoose = require("mongoose");
const { Schema } = mongoose;

const InvoiceSchema = new Schema({
    _id: { type: Object, required: true },
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    invoiceAmount: { type: String, required: true },
    invoiceStatus: { type: String, required: true },
    invoiceDueDate: { type: String, required: true },
    clientName: { type: String, required: true },
    clientStreet: { type: String, required: true },
    clientCity: { type: String, required: true },
    clientEmail: { type: String, required: true },
    invoicePdf: { type: Boolean, required: true },
    invoiceSent: { type: Boolean, required: true },
});

const InvoiceCollection = mongoose.model("invoice", InvoiceSchema);

module.exports = InvoiceCollection;