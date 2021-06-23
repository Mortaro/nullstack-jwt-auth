import Nullstack from 'nullstack';

class Home extends Nullstack {

  prepare({ page, project }) {
    page.title = `Private Route - ${project.name}`;
  }

  static async privateServerFunction({ request }) {
    if(!request.me) return false;
    console.log("yay authorized for", request.me.name)
  }

  async initiate() {
    await this.privateServerFunction()
  }
 
  render({ me }) {
    return JSON.stringify(me)
  }

}

export default Home;