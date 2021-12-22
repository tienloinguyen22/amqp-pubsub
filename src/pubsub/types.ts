export type MessageHandler<T> = (data: { payload: T; routingKey: string }) => Promise<MessageHandlerResult>;

export type Unsubscribe = () => void;

export type Subscribe = <T>(bindKeys: string[], handler: MessageHandler<T>) => Promise<Unsubscribe>;

export enum MessageHandlerResult {
  Ack,
  Nack,
  Reject
}

export interface AssertPublishConfigs {
  rabbitUrl: string;
  exchangeName: string;
}

export interface AssertSubscribeConfigs {
  rabbitUrl: string;
  serviceName: string;
  exchangeName: string;
  dlxName?: string;
  dlqName?: string;
  dlk?: string;
}