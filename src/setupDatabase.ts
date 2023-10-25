import mongoose from 'mongoose';
import { config } from './config';
import { connectClient } from '@service/redis/redisClient';

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        console.log('Connected to DB');
        connectClient();
      })
      .catch((error) => {
        console.log(error);
        return process.exit();
      });
  };
  connect();
  mongoose.connection.on('disconnected', connect);
};
