const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/foodexpress';

const connect = async (uri = process.env.MONGO_URI || DEFAULT_URI) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[MongoDB] Connected to ${uri}`);
  return mongoose.connection;
};

const disconnect = async () => {
  await mongoose.disconnect();
};

const isConnected = () => mongoose.connection.readyState === 1;

module.exports = { connect, disconnect, isConnected, DEFAULT_URI };
