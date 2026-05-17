const { execFileSync, spawn } = require('child_process');
const path = require('path');

const port = String(process.env.PORT || 4000);
const host = process.env.HOST || '127.0.0.1';

function localBin(name) {
  const suffix = process.platform === 'win32' ? '.cmd' : '';
  return path.join(process.cwd(), 'node_modules', '.bin', `${name}${suffix}`);
}

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function listeningPids(targetPort) {
  if (process.platform === 'win32') {
    const script = [
      `Get-NetTCPConnection -LocalPort ${targetPort} -State Listen -ErrorAction SilentlyContinue`,
      'Select-Object -ExpandProperty OwningProcess -Unique'
    ].join(' | ');

    try {
      return run('powershell.exe', ['-NoProfile', '-Command', script])
        .split(/\r?\n/)
        .map((line) => Number(line.trim()))
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  try {
    return run('lsof', ['-ti', `tcp:${targetPort}`])
      .split(/\r?\n/)
      .map((line) => Number(line.trim()))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function stopPid(pid) {
  if (!pid || pid === process.pid) return;

  try {
    process.kill(pid);
  } catch {
    if (process.platform === 'win32') {
      execFileSync('taskkill.exe', ['/PID', String(pid), '/F'], { stdio: 'ignore' });
    } else {
      execFileSync('kill', ['-9', String(pid)], { stdio: 'ignore' });
    }
  }
}

for (const pid of listeningPids(port)) {
  console.log(`Stopping process ${pid} on ${host}:${port}`);
  stopPid(pid);
}

const child = spawn(localBin('hexo'), ['server', '-i', host, '-p', port], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code || 0);
});
