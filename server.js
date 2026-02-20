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
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

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
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Notificação Acesso Mais Seguro</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto;">
                    <p>Prezados,<br>
                    Venho por meio desta notificar o estado da região próxima à unidade <strong>${posto}</strong>.<br>
                    <br>
                    <strong>Nível:</strong> ${nvl}
                    </p>
                    
                    <div style="margin-top: 20px; margin-bottom: 20px;">
                        ${nvl === '🟢' ? 
                            '<p>A área apresenta <strong style="color: #28a745;">situações normais</strong>, sem ocorrências. Todos os serviços estão acessíveis e a unidade está funcionando dentro dos parâmetros esperados.</p>' 
                            : ''}
                            
                        ${nvl === '🟡' ? 
                            '<p>A área apresenta <strong style="color: #ffc107;">situação de alerta </strong>, necessário averiguação de ocorrência no local.</p>' 
                            : ''}
                            
                        ${nvl === '🟠' ? 
                            '<p>A área apresenta <strong style="color: #ffc107;">situação de perigo</strong>, podendo evoluir para alto risco. Atenção para novas atualizações.</p>' 
                            : ''}
                            
                        ${nvl === '🔴' ? 
                            '<p>A área apresenta <strong style="color: #dc3545;">situação de alto risco</strong>, causando dependência de interrupção nos serviços da unidade até normalização.</p>' 
                            : ''}
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                        <p><strong>Data e hora da notificação:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                        <p style="margin-top: 20px;">Este é um e-mail automático. Em caso de dúvidas, entre em contato com <a href="mailto:octavio.polari@gmail.com">Octavio Polari Jardim 50562</a>.</p>
                    </div>
                </div>
            </body>
            </html>
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

app.post("/api/conexao_estavel", async (req, res) => {
    console.log("📩 Requisição recebida:", req.body);

    const posto = req.body.posto;
    const nvl = req.body.nvl;
    const visita = req.body.visita;
    const horaVisita = req.body.horaVisita;
    const volta = req.body.volta;

    const mail = {
        sender: { email: process.env.BREVO_FROM },
        to: [{ email: process.env.SEND_USER }],
        subject: `${nvl} Informes Conexão Estável ${nvl}`,
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Notificação de Status de Internet</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto;">
                    <p>Prezados,<br>
                    Venho por meio desta notificar o estado da conectividade de internet no na unidade <strong>${posto}</strong>.<br>
                    <br>
                    <strong>Nível:</strong> ${nvl}
                    </p>
                    
                    <div style="margin-top: 20px;">
                        ${nvl === '🟢' ? 
                                '<p>A conexão de internet está <strong style="color: #28a745;">operando normalmente</strong>, sem interrupções detectadas. Todos os serviços estão acessíveis e a velocidade está dentro dos parâmetros esperados.</p>' 
                                : ''}
                            
                        ${nvl === '🟡' ? 
                                '<p>A conexão de internet está <strong style="color: #ffc107;">apresentando instabilidade</strong>, com flutuações intermitentes. Isso pode causar lentidão no acesso a serviços e eventual indisponibilidade temporária.</p>'
                                : ''}
                            
                            ${nvl === '🔴' ? 
                                `<p>A conexão de internet está <strong style="color: #dc3545;">completamente inoperante</strong>. Não há acesso à rede externa, o que impacta todos os serviços dependentes de conectividade.</p><br>
                                <strong>OBS:</strong> <p>${obs}</p>

                                <div>
                                    ${visita === 'Sim' ? 
                                        `<strong>Visita:</strong> <p style="color: #28a745;">Foi realizada às <strong>${horaVisita}.</strong></p><br>
                                        <p>A volta está prevista para ocorrer em: <strong>${volta} horas</strong></p>`
                                        : '<strong>Visita:</strong> <p style="color: #dc3545;">Ainda não realizada.</p>'
                                    }
                                </div>`
                            : ''}
                    </div>
                    
                    

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                        <p><strong>Data e hora da notificação:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                        <p style="margin-top: 20px;">Este é um e-mail automático. Em caso de dúvidas, entre em contato com <a href="mailto:octavio.polari@gmail.com">Octavio Polari Jardim 50562</a>.</p>
                    </div>
                </div>
            </body>
            </html>
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
    console.log("📩 Requisição recebida em /api/bolsa_familia");

    const { filename, mimeType, data } = req.body;

    if (!filename || !data) {
        return res.status(400).json({ success: false, message: 'filename e data (base64) são obrigatórios' });
    }

    const mail = {
        sender: { email: process.env.BREVO_FROM },
        to: [{ email: process.env.SEND_USER }],
        subject: '📎 PDF do Cadastro do Bolsa Família',
        htmlContent: `
            Prezados,<br>
            <br>
            Segue em anexo o PDF gerado pelo aplicativo de cadastro do Bolsa Família.<br><br>
            <strong>Arquivo:</strong> ${filename}
        `,
        attachment: [
            {
                name: filename,
                content: data, // o Brevo já espera base64 direto aqui
            },
        ],
    };

    try {
        const response = await apiInstance.sendTransacEmail(mail);
        console.log('✅ E-mail enviado com sucesso:', response.messageId || response);
        res.json({ success: true, message: 'E-mail enviado com sucesso!' });
    } catch (err) {
        console.error('❌ Erro no envio do e-mail:', err);
        res.status(500).json({ success: false, message: 'Erro ao enviar e-mail', error: String(err) });
    }
});


app.listen(PORT, () => {
    console.log(`Server is online on port: ${PORT}`)
    console.log(`Sending e-mail to: ${process.env.SEND_USER}`)
});