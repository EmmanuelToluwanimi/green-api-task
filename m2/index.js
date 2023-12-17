const express = require('express');
const { InitQueue, RABBITMQ_VARIABLES } = require('./queue');
const app = express();
const PORT = process.env.PORT || 5002;

async function ProcessTask() {
  //Initializes queue;
  const queue = await InitQueue();

  // Consumes 
  queue.channel.consume(RABBITMQ_VARIABLES.queueName.REQUEST, (message) => {
    const data = JSON.parse(message.content.toString());
    const result = data * 2;

    queue.channel.ack(message);

    // Introduces a 5-second delay as specified in the requirements;
    setTimeout(() => {
      // Publishes the result value to the result queue after the delay
      queue.channel.sendToQueue(
        RABBITMQ_VARIABLES.queueName.RESULT,
        Buffer.from(JSON.stringify(result)),
      );

      console.log(`Message processed and published to ${RABBITMQ_VARIABLES.queueName.RESULT}: ${result}`);
    }, 5000);
  });
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  ProcessTask();
});