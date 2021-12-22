import * as process from 'process';
import { assertSubscribe, MessageHandlerResult } from '../pubsub';

const subscriber = async () => {
  const allowedBindingKeys = ['warn', 'info', 'error', 'debug'];
  const args = process.argv.slice(2);
  if (args.length == 0) {
    console.log("Please provide binding keys: ['warn', 'info', 'error', 'debug']");
    process.exit(1);
  }
  for (const arg of args) {
    if (!allowedBindingKeys.includes(arg)) {
      console.log(`Invalid binding key: ${arg}`);
      process.exit(1);
    }
  }

  const subscribe = await assertSubscribe({
    rabbitUrl: 'amqp://localhost:5672',
    serviceName: args.join('-'),
    exchangeName: 'pubsub-logs',
  });
  await subscribe(args, async (message) => {
    console.log('--------------------');
    console.log('🚀 Log level: ', message.routingKey);
    console.log('🚀 Payload: ', message.payload);
    return MessageHandlerResult.Ack;
  })
};

subscriber();