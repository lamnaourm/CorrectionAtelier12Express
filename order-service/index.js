const express = require("express");
const amqp = require("amqplib");
const mongoose = require("mongoose");
const orderModel = require("./models/Order");

const app = express();

app.use(express.json());

let connection, channel;
const queueName = "order-service-queue";

mongoose
  .connect(`mongodb://localhost:27017/dborders`, { useNewUrlParser: true })
  .then(() => console.log("BD : connexion reussie "))
  .catch((error) => console.log("Erreur de connexion" + error));

async function connectToRabbitMQ() {
  const amqpServer = "amqp://guest:guest@localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queueName);
}
connectToRabbitMQ().then(() => {
    channel.consume(queueName, (data) => {
        const products = JSON.parse(data.content.toString());
        let total = 0;
        products.forEach(element => {
            total += element.price;
        });
        const order = new orderModel({products:products, total:total})
        order.save().then(()=> {
            console.log('Order cree');
        })

        channel.ack(data);
    })
});

app.listen(3001, () => {
  console.log("Serveur lance");
});
