import { ConsumeMessage } from 'amqplib';
import { AssertSubscribeConfigs } from '.';
import { DEAD_LETTER_EXCHANGE_TYPE, EXCHANGE_TYPE } from './constants';
import { MessageHandler, MessageHandlerResult, Subscribe, Unsubscribe } from './types';
import { resolveChannel } from './utils';

export const assertSubscribe = async (configs: AssertSubscribeConfigs): Promise<Subscribe> => {
  const channel = await resolveChannel(configs.rabbitUrl);

  const dlxName = configs.dlxName || `dlx.${configs.exchangeName}`;
  await Promise.all([
    channel.assertExchange(configs.exchangeName, EXCHANGE_TYPE),
    channel.assertExchange(dlxName, DEAD_LETTER_EXCHANGE_TYPE)
  ]);

  return async <T>(bindKeys: string[], msgHandler: MessageHandler<T>): Promise<Unsubscribe> => {
    const queueName = `pubsub.${configs.serviceName}`;
    const dlqName = configs.dlqName || `pubsub.${configs.serviceName}.dlq`;
    const dlk = configs.dlk || `dlk.${queueName}`;
  
    const [{ queue }, { queue: deadLetterQueue }] = await Promise.all([
      channel.assertQueue(queueName, {
        durable: true,
        deadLetterExchange: dlxName,
        deadLetterRoutingKey: dlk,
      }),
      channel.assertQueue(dlqName)
    ]);

    await Promise.all([
      ...bindKeys.map((bindKey) => channel.bindQueue(queue, configs.exchangeName, bindKey)),
      channel.bindQueue(deadLetterQueue, dlxName, dlk),
    ])

    const { consumerTag } = await channel.consume(queue, async (msg: ConsumeMessage) => {
      const contentStr = msg.content.toString();
      let [payload, err] = [null, null]
      try {
        payload = JSON.parse(contentStr);
      } catch (error) {
        err = error
      }
      if (err) {
        return console.log('Error: ', err);
      }

      const result = await msgHandler({
        payload,
        routingKey: msg.fields.routingKey,
      });

      if (result === MessageHandlerResult.Ack) {
        channel.ack(msg);
      } else if (result === MessageHandlerResult.Nack) {
        channel.nack(msg);
      } else {
        channel.reject(msg);
      }
    });

    return () => {
      channel.cancel(consumerTag);
    };
  };
};