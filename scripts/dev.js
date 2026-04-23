const { spawn } = require('node:child_process');

const commands = [
  { name: 'server', command: 'npm', args: ['run', 'dev', '--prefix', 'server'] },
  { name: 'client', command: 'npm', args: ['run', 'dev', '--prefix', 'client'] }
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
});

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  children.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
