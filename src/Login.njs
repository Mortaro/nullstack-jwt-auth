import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Nullstack from 'nullstack';

class Login extends Nullstack {

  email = '';
  password = '';

  error = null;

  prepare({ page, project }) {
    page.title = `Login - ${project.name}`;
  }

  static async attemptLogin({ database, request, secrets, email, password }) {
    if (!email || !password) {
      return { error: 'Fill all the fields' };
    }
    const me = await database.collection('users').findOne({ email });
    if (!me) {
      return { error: 'Invalid credentials' };
    }
    console.log(me)
    const verified = await compare(password, me.encryptedPassword);
    if (!verified) {
      return { error: 'Invalid credentials' }
    };
    request.session.token = jwt.sign(me._id.toString(), secrets.session);
    delete me.encryptedPassword;
    return { me };
  }

  async login(context) {
    const { me, error } = await this.attemptLogin({
      email: this.email,
      password: this.password,
    });
    if (error) {
      this.error = error;
    } else {
      context.me = me;
    }
  }

  render() {
    return (
      <form onsubmit={this.login}>
        <div>
          <label> Email </label>
          <input type="email" bind={this.email} autofocus={true} />
        </div>
        <div>
          <label> Password </label>
          <input type="password" bind={this.password} />
        </div>
        {this.error && <p> {this.error} </p>}
        <button>
          Login
        </button>
      </form>
    )
  }

}

export default Login;