const express = require("express");
const amqp = require("amqplib");
const ProductModel = require("../models/Product");

const routes = express.Router();

let connection, channel;
const queueName = "order-service-queue";

async function connectToRabbitMQ() {
  const amqpServer = "amqp://guest:guest@localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queueName);
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
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(prds)));
  })



});

module.exports = routes;
