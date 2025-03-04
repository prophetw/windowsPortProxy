const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 提供前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 设置端口转发
app.post('/set-proxy', (req, res) => {
  const { listenPort, listenAddress, connectPort, connectAddress } = req.body;
  const psCommand = `powershell.exe -Command "netsh interface portproxy add v4tov4 listenport=${listenPort} listenaddress=${listenAddress} connectport=${connectPort} connectaddress=${connectAddress}"`;

  exec(psCommand, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      return res.status(500).json({ success: false, message: stderr });
    }
    console.log(`Success: ${stdout}`);
    res.json({ success: true, message: '端口转发已设置！' });
  });
});

// 删除端口转发规则
app.post('/delete-proxy', (req, res) => {
  const { listenPort, listenAddress } = req.body;
  const psCommand = `powershell.exe -Command "netsh interface portproxy delete v4tov4 listenport=${listenPort} listenaddress=${listenAddress}"`;

  exec(psCommand, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      return res.status(500).json({ success: false, message: stderr });
    }
    console.log(`Success: Rule deleted for ${listenAddress}:${listenPort}`);
    res.json({ success: true, message: `已删除 ${listenAddress}:${listenPort} 的转发规则！` });
  });
});

// 获取当前所有转发规则
app.get('/get-proxy', (req, res) => {
  const psCommand = `powershell.exe -Command "netsh interface portproxy show v4tov4"`;
  exec(psCommand, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, message: stderr });
    }

    // 解析 netsh 输出
    const lines = stdout.split('\n');
    const rules = [];
    let started = false;

    for (const line of lines) {
      if (line.includes('----')) {
        started = true; // 表格开始
        continue;
      }
      if (started && line.trim()) {
        const [listenAddress, listenPort, connectAddress, connectPort] = line.trim().split(/\s+/);
        rules.push({ listenAddress, listenPort, connectAddress, connectPort });
      }
    }

    res.json({ success: true, rules });
  });
});


const PORT = 6006
app.listen(6006, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});