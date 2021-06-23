import Nullstack from 'nullstack';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

class Register extends Nullstack {
  
  name = '';
  email = '';
  password = '';

  error = null;

  prepare({ page, project }) {
    page.title = `Create Account - ${project.name}`;
  }

  static async insertUser({ database, request, secrets, name, email, password }) {
    if(!name || !email || !password) {
      return { error: 'Fill all the fields' };
    }
    const emailTaken = await database.collection('users').findOne({ email })
    if(emailTaken) {
      return { error: 'Email Taken' };
    }
    const encryptedPassword = await hash(password, 10);
    const me = {
      email,
      name,
      createdAt: new Date()
    };
    const { insertedId } = await database.collection('users').insertOne({
      ...me,
      encryptedPassword,
    });
    me._id = insertedId;
    request.session.token = jwt.sign(me._id.toString(), secrets.session);
    return { me };
  }

  async register(context) {
    const { router } = context
    let { error, me } = await this.insertUser({
      name: this.name,
      password: this.password,
      email: this.email,
    });
    if(error) {
      this.error = error;
    } else {
      context.me = me;
      router.url = '/';
    }
  }

  render() {
    return (
      <form onsubmit={this.register}>
        <div>
          <label> Name </label>
          <input type="text" bind={this.name} autofocus={true} />
        </div>
        <div>
          <label> Email </label>
          <input type="email" bind={this.email} />
        </div>
        <div>
          <label> Password </label>
          <input type="password" bind={this.password} />
        </div>
        {this.error && <p> {this.error} </p>}
        <button>
          Register
        </button>
      </form>
    )
  }


}

export default Register;