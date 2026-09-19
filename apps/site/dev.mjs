// 本地开发：并行跑 sync --watch 与 vitepress dev，任一进程退出则整体退出
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(fileURLToPath(import.meta.url));
const children = [];

function run(name, cmd, args) {
  const p = spawn(cmd, args, { cwd: siteDir, stdio: ['ignore', 'inherit', 'inherit'] });
  p.label = name;
  children.push(p);
  p.on('exit', code => {
    console.log(`[${name}] 退出（code=${code}）`);
    shutdown(code ?? 0);
  });
  return p;
}

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const p of children) if (p.exitCode === null && p.signalCode === null) p.kill('SIGTERM');
  process.exit(code);
}
process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(143));

run('sync', process.execPath, ['sync.mjs', '--watch']);
run('vitepress', process.execPath, [join(siteDir, 'node_modules', 'vitepress', 'bin', 'vitepress.js'), 'dev', 'docs']);
