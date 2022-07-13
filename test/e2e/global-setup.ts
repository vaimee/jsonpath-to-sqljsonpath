import './env';
import { execSync } from 'child_process';
import { path as rootPath } from 'app-root-path';
import detectPort from 'detect-port';
import dockerCompose from 'docker-compose';

export default async function () {
  console.time('global-setup');
  console.log('\n');

  const dbPort = Number(process.env.DB_PORT);

  // Speed up during development, if already live then do nothing
  const reachablePort = await detectPort(dbPort);
  if (reachablePort !== dbPort) {
    console.warn(`There is already a service listening on port ${dbPort}`);
    console.warn('Skipping the db configuration phase');
    return;
  }

  await dockerCompose.upAll({
    cwd: `${rootPath}/test/e2e`,
    log: true,
  });

  await dockerCompose.exec('database', ['sh', '-c', 'until pg_isready ; do sleep 1; done'], {
    cwd: `${rootPath}/test/e2e`,
  });

  execSync('npm run test:e2e:seed');

  console.timeEnd('global-setup');
}
