const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

// Route for testing the server
app.get("/", (req, res) => {
    res.send("Backend server is running. Use the frontend to submit the form.");
});

// Handle form submissions
app.post("/submit", (req, res) => {
    const data = req.body;

    // Create a PDF document
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
    pdfDoc.text(`Digital Signature: Attached`);
    pdfDoc.end();

    stream.on("finish", async () => {
        try {
            // Send an email with the PDF attachment
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "info@movne.co.il", // Replace with your email
                    pass: "YOUR_EMAIL_PASSWORD" // Replace with your email password
                }
            });

            await transporter.sendMail({
                from: "info@movne.co.il",
                to: [data.email, "info@movne.co.il"],
                subject: "Questionnaire Submission",
                text: "Your questionnaire has been successfully submitted. See attached PDF.",
                attachments: [{ filename: "submission.pdf", path: pdfPath }]
            });

            // Cleanup the file
            fs.unlinkSync(pdfPath);

            res.status(200).send("Form submitted successfully!");
        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).send("Error submitting the form.");
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
