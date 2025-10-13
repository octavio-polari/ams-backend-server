const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

var brevo = require('sib-api-v3-sdk');
var defaultClient = brevo.ApiClient.instance;
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API;

const apiInstance = new brevo.TransactionalEmailsApi();

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

app.post("/api/contact", async (req, res) => {
    console.log("📩 Requisição recebida:", req.body);

    const posto = req.body.posto;
    const nvl = req.body.nvl;

    const mail = {
        sender: { email: process.env.BREVO_FROM },
        to: [{ email: process.env.SEND_USER }],
        subject: 'Notificação Acesso Mais Seguro',
        html: `
            Prezados,<br>
            Venho por meio desta notificar uma situação de risco.<br>
            <br>
            <strong>Posto:</strong> ${posto}<br>
            <strong>Nível:</strong> ${nvl}
        `
    };

    try {
        await apiInstance.sendTransacEmail(mail);

        res.status(500).json({code: 500, error});
        console.log(500,"Message Failed!\n",error)
    } catch {
        res.json({ code: 200, status: 'Message Sent!' })
        console.log(200,"Message Sent!")
    }
})

app.listen(PORT, () => {
    console.log(`Server is online on port: ${PORT}`)
    console.log(`Sending e-mail to: ${process.env.SEND_USER}`)
});