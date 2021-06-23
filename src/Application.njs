import Nullstack from 'nullstack';
import cookieSession from 'cookie-session'
import {MongoClient, ObjectID} from 'mongodb';
import jwt from 'jsonwebtoken';

import Login from './Login';
import Home from './Home';
import Register from './Register';

import './Application.scss';

class Application extends Nullstack {

  static async start(context) {
    const { server, secrets } = context

    const databaseClient = new MongoClient(secrets.databaseUrl, { 
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await databaseClient.connect();
    const database = await databaseClient.db(secrets.databaseName);
    context.database = database;

    server.use(cookieSession({
      name: 'session',
      keys: ['token'],
    }))

    server.use(async (request, response, next) => {
      if(!request.session.token) {
        request.me = null;
      } else {
        try {
          const id = jwt.verify(request.session.token, secrets.session)
          const me = await database.collection('users').findOne({
            _id: ObjectID(id)
          });
          delete me.encryptedPassword;
          request.me = me;
        } catch(e) {
          request.me = null;
          request.session.token = null;
        }
      }
      next();
    })
  }

  static async getCurrentUser({ request }) {
    return request.me;
  }

  async initiate(context) {
    context.me = await this.getCurrentUser();
  }

  static async clearSession({ request }) {
    request.session.token = null;
  }

  async logout(context) {
    this.clearSession();
    context.me = null;
  }

  prepare({ page }) {
    page.locale = 'en-US';
  }

  render({ me }) {
    return (
      <main>
        {!me && <Register route="/register" />}
        {!me && <Login route="*" />}
        <Home route="/" />
        {me && <button onclick={this.logout}> Logout </button>}
      </main>
    )
  }

}

export default Application;