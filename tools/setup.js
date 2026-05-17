const { spawnSync } = require('child_process');

function run(label, cmd, args) {
  console.log(`\n> ${label}`);
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.error) {
    console.error(result.error.message);
  }
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run('Install dependencies from yarn.lock', 'yarn', ['install', '--frozen-lockfile']);
run('Verify Hexo can generate the site', 'yarn', ['build']);
