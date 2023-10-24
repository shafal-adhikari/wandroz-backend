import mongoose from 'mongoose';
import { config } from './config';

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        console.log('Connected to DB');
      })
      .catch((error) => {
        console.log(error);
        return process.exit();
      });
  };
  connect();
  mongoose.connection.on('disconnected', connect);
};
