const express = require('express');
const { InitQueue, RABBITMQ_VARIABLES } = require('./queue');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

let queue;

app.post('/', async (req, res) => {
  try {
    const data = req.body.input;

    // validates input value;
    if (typeof data !== 'number') {
      throw { message: "Input must be a number", code: 400 };
    }

    // Initalizes queue
    const queue = await InitQueue();

    // Sends input data to the queue
    queue.channel.sendToQueue(
      queue.queueName,
      Buffer.from(JSON.stringify(data)),
    );
    console.log(`Input published to ${queue.queueName}: ${JSON.stringify(data)}`);

    // Waits for the result from the RESULT queue;
    const result = await new Promise((resolve) => {
      const queueName = RABBITMQ_VARIABLES.queueName.RESULT;
      queue.channel.consume(queueName, (message) => {
        const resultData = JSON.parse(message.content.toString());
        
        console.log(`Final result received from ${queueName}: ${JSON.stringify(resultData)}`);

        queue.channel.ack(message);
        resolve(resultData);
      });
    });

    // Closes connection;
    queue.channel.close();

    return res.json({
      status: "success",
      message: "Successful request",
      data: result,
    });
  } catch (error) {
    return res.status(
      error?.code || 500
    ).json({
      status: "failed",
      message: error.message,
    });
  }
});


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});