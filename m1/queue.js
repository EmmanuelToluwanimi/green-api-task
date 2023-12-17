const amqplib = require("amqplib");

const RABBITMQ_VARIABLES = {
  connection_url: process.env.NODE_ENV === 'production' ? process.env.RABBITMQ_URL : "amqp://localhost",
  queueName: {
    REQUEST: "request-hook",
    RESULT: "result-hook"
  },
};

// Initializes RabbitMQ message queue;
const InitQueue = async () => {
  const connection = await amqplib.connect(RABBITMQ_VARIABLES.connection_url);
  const channel = await connection.createChannel();
  console.log('Connected to RabbitMQ');

  const queueName = RABBITMQ_VARIABLES.queueName.REQUEST;

  await channel.assertQueue(queueName, { durable: true });
  await channel.assertQueue(RABBITMQ_VARIABLES.queueName.RESULT, { durable: true });

  return {
    channel,
    queueName
  };
};

module.exports = {
  RABBITMQ_VARIABLES,
  InitQueue
}