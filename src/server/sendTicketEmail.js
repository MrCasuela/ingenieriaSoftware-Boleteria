const express = require('express')
const nodemailer = require('nodemailer')
const app = express()
app.use(express.json())

app.post('/api/send-ticket', async (req, res) => {
  const { to, subject, body } = req.body

  console.log('Solicitud recibida para enviar correo a:', to) // <-- Agrega esta línea

  // Configura tu transporte SMTP (usa variables de entorno en producción)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fesalazar03@gmail.com',
      pass: 'cbjx vsnq dbch hvtd'

    }
  })

  try {
    await transporter.sendMail({
      from: '"Boletería" <fesalazar03@gmail.com>',
      to,
      subject,
      text: JSON.stringify(body, null, 2) // Puedes personalizar el formato
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.listen(3001, () => console.log('Servidor de correo en puerto 3001'))
