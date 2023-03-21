const express = require("express");
const amqp = require("amqplib");
const mongoose = require("mongoose");
const orderModel = require("./models/Order");

const app = express();

app.use(express.json());

let connection, channel;
const queueName1 = "order-service-queue";
const queueName2 = "product-service-queue";
const queueName3 = "notification-service-queue";

mongoose
  .connect(`mongodb://db:27017/dborders`, { useNewUrlParser: true })
  .then(() => console.log("BD : connexion reussie "))
  .catch((error) => console.log("Erreur de connexion" + error));

async function connectToRabbitMQ() {
  const amqpServer = "amqp://guest:guest@rabbit:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queueName1);
  await channel.assertQueue(queueName2);
  await channel.assertQueue(queueName3);
}
connectToRabbitMQ().then(() => {
    channel.consume(queueName1, (data) => {
        const products = JSON.parse(data.content.toString());
        let total = 0;
        products.forEach(element => {
            total += element.price;
        });
        const order = new orderModel({products:products, total:total})
        order.save().then((ord)=> {
            channel.sendToQueue(queueName2, Buffer.from(JSON.stringify(ord)))
            channel.sendToQueue(queueName3, Buffer.from(JSON.stringify(ord)))
        })

        channel.ack(data);
    })
});

app.listen(3000, () => {
  console.log("Serveur lance");
});
