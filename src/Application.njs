import Nullstack from 'nullstack';
import Home from './Home';
import Login from './Login';
import Register from './Register';

class Application extends Nullstack {

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