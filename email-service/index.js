const express = require("express");
const amqp = require("amqplib");
var nodemailer = require('nodemailer');


const app = express();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'testnodemailer2023@gmail.com',
      pass: 'dweyjeqhbmdlkmdn'
    }
  });

app.use(express.json());

let connection, channel;
const queueName1 = "notification-service-queue";

async function connectToRabbitMQ() {
  const amqpServer = "amqp://guest:guest@rabbit:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queueName1);
}
connectToRabbitMQ().then(() => {
    channel.consume(queueName1, (data) => {
        
        var mailOptions = {
            from: 'testnodemailer2023@gmail.com',
            to: 'mohammed.lamnaour@gmail.com',
            subject: 'Sending Email using Node.js',
            text: 'commande cree ' + data.content.toString()
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        channel.ack(data);
    })
});

app.listen(3000, () => {
  console.log("Serveur lance");
});
