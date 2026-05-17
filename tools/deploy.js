const { spawnSync } = require('child_process');
const path = require('path');

function localBin(name) {
  const suffix = process.platform === 'win32' ? '.cmd' : '';
  return path.join(process.cwd(), 'node_modules', '.bin', `${name}${suffix}`);
}

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

const hexoBin = localBin('hexo');

run('Clean generated files', hexoBin, ['clean']);
run('Generate static site', hexoBin, ['generate']);
run('Deploy to configured repository', hexoBin, ['deploy']);
