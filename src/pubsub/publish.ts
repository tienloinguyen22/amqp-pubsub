import { AssertPublishConfigs } from '.';
import { EXCHANGE_TYPE } from './constants';
import { bufferMsg, resolveChannel } from './utils';

export const assertPublish = async (configs: AssertPublishConfigs) => {
  const channel = await resolveChannel(configs.rabbitUrl);
  await channel.assertExchange(configs.exchangeName, EXCHANGE_TYPE);

  return <T>(msg: T, routingKey: string) => {
    return channel.publish(configs.exchangeName, routingKey, bufferMsg(msg));
  };
};