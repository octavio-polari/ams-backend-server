const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

require('dotenv').config();

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors({
    origin: "*", // para testar
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));
app.use(bodyParser.json());

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" })
});

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS
    }
});

transporter.verify((error) => {
    if (error) {
        console.log("HERE'S THE ERROR:\n",error)
    } else {
        console.log('Ready to send!')
    }
})

app.post("/api/contact", (req, res) => {
    const posto = req.body.posto;
    const nvl = req.body.nvl;
    const mail = {
        from: process.env.BREVO_FROM,
        to: process.env.SEND_USER,
        subject: 'Notificação Acesso Mais Seguro',
        html: `
            Prezados,<br>
            Venho por meio desta notificar uma situação de risco.<br>
            <br>
            <strong>Posto:</strong> ${posto}<br>
            <strong>Nível:</strong> ${nvl}
        `
    };
    transporter.sendMail(mail, (error) => {
        if (error) {
            res.status(500).json({code: 500, error});
        } else {
            res.json({ code: 200, status: 'Message Sent!' })
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server is online on port: ${PORT}`)
});