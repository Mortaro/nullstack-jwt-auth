import cookieSession from 'cookie-session';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectID } from 'mongodb';
import Nullstack from 'nullstack';
import Application from './src/Application';

const context = Nullstack.start(Application);
const { server, secrets } = context

server.use(cookieSession({
  name: 'session',
  keys: ['token'],
}))

server.use(async (request, response, next) => {
  if (!request.session.token) {
    request.me = null;
  } else {
    try {
      const id = jwt.verify(request.session.token, secrets.session)
      const me = await context.database.collection('users').findOne({
        _id: ObjectID(id)
      });
      delete me.encryptedPassword;
      request.me = me;
    } catch (e) {
      request.me = null;
      request.session.token = null;
    }
  }
  next();
})

context.start = async function start() {
  const databaseClient = new MongoClient(secrets.databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await databaseClient.connect();
  context.database = await databaseClient.db(secrets.databaseName);
}

export default context