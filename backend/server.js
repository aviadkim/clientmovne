const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

// Email Configuration
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "info@movne.co.il",
        pass: "YOUR_EMAIL_PASSWORD" // Replace this with your actual email password
    }
});

// Handle form submission
app.post("/submit", (req, res) => {
    const data = req.body;

    // Generate PDF
    const pdfDoc = new PDFDocument();
    const pdfPath = `submission-${Date.now()}.pdf`;
    const stream = pdfDoc.pipe(fs.createWriteStream(pdfPath));

    pdfDoc.text("Questionnaire Submission");
    pdfDoc.text(`Full Name: ${data.fullName}`);
    pdfDoc.text(`ID Number: ${data.idNumber}`);
    pdfDoc.text(`Email: ${data.email}`);
    pdfDoc.text(`Phone: ${data.phone}`);
    pdfDoc.text(`Birth Date: ${data.birthDate}`);
    pdfDoc.text(`Investment Amount: ${data.investmentAmount}`);
    pdfDoc.text(`Investment Duration: ${data.investmentDuration}`);
    pdfDoc.text(`Risk Level: ${data.riskLevel}`);
    pdfDoc.text(`Digital Signature included.`);
    pdfDoc.end();

    stream.on("finish", async () => {
        try {
            // Send Email with PDF
            await transporter.sendMail({
                from: "info@movne.co.il",
                to: ["info@movne.co.il", data.email],
                subject: "Questionnaire Submission",
                text: "Attached is the filled questionnaire.",
                attachments: [{ path: pdfPath }]
            });

            fs.unlinkSync(pdfPath); // Cleanup file after sending
            res.status(200).send("Submission successful!");
        } catch (error) {
            res.status(500).send("Failed to send email.");
        }
    });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
