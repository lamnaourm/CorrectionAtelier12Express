const express = require("express");
const amqp = require("amqplib");
const ProductModel = require("../models/Product");

const routes = express.Router();

let connection, channel;
const queueName1 = "order-service-queue";
const queueName2 = "product-service-queue";

async function connectToRabbitMQ() {
  const amqpServer = "amqp://guest:guest@rabbit:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queueName1);
  await channel.assertQueue(queueName2);
}
connectToRabbitMQ();

routes.post("/", (req, res) => {
  const mproduct = new ProductModel(req.body);

  mproduct
    .save()
    .then((produit) => {
      res.status(200).json({ message: "creation reussie", produit: produit });
    })
    .catch(() => {
      res.status(500).json({ message: "err sauvegarde de user" });
    });
});

routes.post("/buy", (req, res) => {
  const ids = req.body; 

  ProductModel.find({_id: {$in :ids}}).then((prds) => {
    channel.sendToQueue(queueName1, Buffer.from(JSON.stringify(prds)));

    channel.consume(queueName2, (data) => {
      res.json({message:'order cree', order: JSON.parse(data.content.toString())})
    })
  })



});

module.exports = routes;
