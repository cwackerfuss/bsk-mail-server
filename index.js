const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const pug = require('pug');

const mailgun = require('mailgun-js')({
  apiKey: 'key-93a843e125e9e81bdba7da0ace677387',
  domain: 'sandboxd3b3903c153d4279963f0787a3061f0c.mailgun.org'
})

const mailerPath = path.join(__dirname, "mailers")

const PORT = process.env.PORT || 5000;

// spin up server
const app = express();
app.use(bodyParser.json());
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "mailers"));

const mailers = [
  'recovery',
  'verification'
]

mailers.forEach(function(mailer) {
  app.get(`/${mailer}`, (req, res) => { res.render(mailer) })
})

app.post('/backup', function(req, res) {
  const recipientEmail = req.body.email
  const seedRecovery = req.body.seedRecovery

  const html = pug.renderFile(`${mailerPath}/recovery.pug`, {
    seedRecovery
  })

  const message = {
    to: recipientEmail,
    from: 'hello@blockstack.org',
    subject: 'Your Blockstack Recovery Kit',
    html: html
  }
  mailgun.messages().send(message).then(
    (response, err) => { res.send('OK') },
    (error) => { console.error(error) }
  )
})

app.post('/verify', function(req, res) {
  const recipientEmail = req.body.email
  const emailVerificationLink = req.body.emailVerificationLink

  const html = pug.renderFile(`${mailerPath}/verification.pug`, {
    emailVerificationLink
  })

  const message = {
    to: recipientEmail,
    from: 'hello@blockstack.org',
    subject: 'Verify your email with Blockstack',
    html: html
  }
  mailgun.messages().send(message).then(
    (response, err) => { res.send('OK') },
    (error) => { console.error(error) }
  )
})

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});
