import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {HttpErrors} from '@loopback/rest';

export class PingController {
  constructor() {}

  @get('/ping')
  ping(): object {
    return {
      greeting: 'Hello from AiZap Backend!',
      date: new Date(),
      url: '/ping',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  @get('/ping/{message}')
  pingWithMessage(@param.path.string('message') message: string): object {
    return {
      greeting: `Hello from AiZap Backend!`,
      message: message,
      date: new Date(),
      url: `/ping/${message}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}
