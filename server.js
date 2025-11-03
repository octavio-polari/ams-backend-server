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

app.post("/api/ams", async (req, res) => {
    console.log("📩 Requisição recebida:", req.body);

    const posto = req.body.posto;
    const nvl = req.body.nvl;

    const mail = {
        sender: { email: process.env.BREVO_FROM },
        to: [{ email: process.env.SEND_USER }],
        subject: `${nvl} Notificação Acesso Mais Seguro ${nvl}`,
        htmlContent: `
            Prezados,<br>
            Venho por meio desta notificar uma situação de risco.<br>
            <br>
            <strong>Posto:</strong> ${posto}<br>
            <strong>Nível:</strong> ${nvl}
        `,
    };

    try {
        await apiInstance.sendTransacEmail(mail);

        res.json({ code: 200, status: 'Message Sent!' });
        console.log(200,"Message Sent!");
    } catch (error) {
        res.status(500).json({code: 500, error});
        console.log(500,"Message Failed!\n",error);
    }
})

// app.post("/api/bolsa_familia", async (req, res) => {
//     console.log("📩 Requisição recebida:", req.body);

//     const attachment = req.body.attachment;

//     const mail = {
//         sender: { email: process.env.BREVO_FROM },
//         to: [{ email: process.env.SEND_USER }],
//         subject: `${nvl} Notificação Acesso Mais Seguro ${nvl}`,
//         htmlContent: `
//             Prezados,<br>
//             ${attachment}
//         `,
//     };

//     try {
//         await apiInstance.sendTransacEmail(mail);

//         res.json({ code: 200, status: 'Message Sent!' });
//         console.log(200,"Message Sent!");
//     } catch (error) {
//         res.status(500).json({code: 500, error});
//         console.log(500,"Message Failed!\n",error);
//     }
// })

app.post('/api/bolsa_familia', async (req, res) => {
  try {
    const { filename, mimeType, data } = req.body;
    if (!filename || !data) {
      return res.status(400).json({ success: false, message: 'filename e data (base64) são obrigatórios' });
    }

    // cria buffer a partir do base64
    const buffer = Buffer.from(data, 'base64');

    // montar e-mail
    const mailOptions = {
      from: process.env.BREVO_FROM,
      to: process.env.SEND_USER,
      subject: 'PDF do formulário',
      text: 'Segue em anexo o PDF do formulário.',
      attachments: [
        {
          filename: filename,
          content: buffer,
          contentType: mimeType || 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.messageId);
    res.json({ success: true, message: 'E-mail enviado', info: info });
  } catch (err) {
    console.error('Erro no /api/send-pdf:', err);
    res.status(500).json({ success: false, message: 'Erro ao enviar e-mail', error: String(err) });
  }
});

app.listen(PORT, () => {
    console.log(`Server is online on port: ${PORT}`)
    console.log(`Sending e-mail to: ${process.env.SEND_USER}`)
});