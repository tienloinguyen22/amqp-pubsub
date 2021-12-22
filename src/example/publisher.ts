import { assertPublish } from '../pubsub';
import { LogLevels } from './types';

const publisher = async () => {
  const publish = await assertPublish({
    rabbitUrl: 'amqp://localhost:5672',
    exchangeName: 'pubsub-logs',
  });
  const logLevels = ['warn', 'info', 'error', 'debug'];
  const logMessages = [
    'Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
    'Curabitur aliquet quam id dui posuere blandit.',
    'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.',
    'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.',
  ];

  setInterval(() => {
    const payload = {
      level: logLevels[Math.floor(Math.random() * logLevels.length)] as LogLevels,
      message: logMessages[Math.floor(Math.random() * logMessages.length)],
    };
    publish<{ level: LogLevels; message: string; }>(payload, payload.level);
    console.log('🚀 Published: ', payload);
  }, 1000);
};

publisher();