import App from 'app';
import AuthRoute from '@routes/auth.route';
import ProjectRoute from '@routes/project.route';
import UserRoute from './routes/user.route';
import validateEnv from 'utils/validateEnv';

validateEnv();

const app = new App([
  new AuthRoute(),
  new ProjectRoute(),
  new UserRoute(),
]);

app.listen();
