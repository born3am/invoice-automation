const express = require("express")
const app = express()
const mongoose = require("mongoose")
require("dotenv").config()
const InvoiceCollection = require("./server/models/InvoiceSchema")

// const pdfAndEmail = require("./pdfAndEmail")

async function watchChangeInMongoDB(collection, pipeline = []) {
    const changeStream = collection.watch(pipeline)
    // const pipeline = [
    //     {
    //         '$match': {
    //             'operationType': 'update',
    //             'invoicePdf': false,
    //             'invoiceSent': false,
    //         }
    //     }
    // ];

    //listener for the change event
    changeStream.on("change", (next) => {
        console.log(next)
        if (next.operationType == "update") {
            if (next.updateDescription.updatedFields.invoicePdf) {
                console.log("here run your main function ,create invoice and send email to user")
                
            }
        }
        if (next.operationType == "insert") {
            if (next.fullDocument.invoicePdf) {
                console.log("here run your main function ,create invoice and send email to user")
            }
            else {
                console.log("do nothing")
            }
        }
    })


}

mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER_NAME}:${process.env.MONGO_DB_USER_PASSWORD}@cluster0.94wey.mongodb.net/companyDB?retryWrites=true&w=majority`, async () => {
    await watchChangeInMongoDB(InvoiceCollection)
})
app.listen(4000, () => {
    console.log("server running on port :4000")
    
})
