// 自动玩贪吃蛇到 100 分
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 读取游戏 HTML
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// 修改游戏逻辑，添加自动控制和截图
html = html.replace('</script>', `
  // 自动控制逻辑
  let autoMode = false;
  let autoScore = 0;
  let autoMoves = 0;
  const AUTO_TARGET = 100; // 目标 100 分
  
  // 简单 AI：蛇头朝向食物
  function autoControl() {
    if (!running || !autoMode) return;
    
    const head = snake[0];
    const dx = food.x - head.x;
    const dy = food.y - head.y;
    
    // 选择最短路径，避免撞自己
    let newDir = { x: 0, y: 0 };
    
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir.x = dx > 0 ? 1 : -1;
      newDir.y = 0;
    } else {
      newDir.x = 0;
      newDir.y = dy > 0 ? 1 : -1;
    }
    
    // 检查是否撞自己
    const testHead = { x: head.x + newDir.x, y: head.y + newDir.y };
    testHead.x = (testHead.x + COLS) % COLS;
    testHead.y = (testHead.y + ROWS) % ROWS;
    
    const willCollide = snake.some(s => s.x === testHead.x && s.y === testHead.y);
    
    if (!willCollide) {
      nextDir = newDir;
    } else {
      // 如果会撞，尝试其他方向
      const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
      for (const d of dirs) {
        if (d.x + dir.x === 0 && d.y + dir.y === 0) continue; // 不能反向
        const test = { x: head.x + d.x, y: head.y + d.y };
        test.x = (test.x + COLS) % COLS;
        test.y = (test.y + ROWS) % ROWS;
        const collide = snake.some(s => s.x === test.x && s.y === test.y);
        if (!collide) {
          nextDir = d;
          break;
        }
      }
    }
    
    autoMoves++;
  }
  
  // 修改游戏循环
  const originalStep = step;
  step = function() {
    if (!running) return;
    
    if (autoMode) {
      autoControl();
      autoScore = score;
    }
    
    originalStep();
    
    // 达到目标后停止
    if (autoMode && score >= AUTO_TARGET) {
      running = false;
      clearInterval(stepTimer);
      
      // 显示结果
      const overlay = document.getElementById('overlay');
      document.getElementById('overlay-title').textContent = '自动演示完成';
      document.getElementById('overlay-sub').textContent = \`自动控制达到 \${AUTO_TARGET} 分\`;
      document.getElementById('final-score').style.display = 'block';
      document.getElementById('final-score').textContent = score + ' 分';
      document.getElementById('start-btn').textContent = '重新开始';
      overlay.classList.remove('hidden');
      
      // 输出结果
      console.log(\`🎮 自动演示完成！\n得分: \${score}\n等级: \${level}\n移动次数: \${autoMoves}\`);
    }
  };
  
  // 修改开始游戏
  const originalStartGame = startGame;
  startGame = function() {
    resize();
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('final-score').style.display = 'none';
    initGame();
    draw();
    restartTimer();
    
    // 自动开始
    setTimeout(() => {
      autoMode = true;
      console.log('🤖 开始自动演示...');
    }, 500);
  };
  
  // 修改键盘控制，在自动模式下禁用
  const originalSetDir = setDir;
  setDir = function(d) {
    if (!autoMode) originalSetDir(d);
  };
  
  // 页面加载后自动开始
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('start-btn').click();
    }, 1000);
  });
</script>`);

// 保存修改后的文件
fs.writeFileSync(path.join(__dirname, 'auto_play.html'), html);

console.log('✅ 已创建自动演示文件：auto_play.html');
console.log('用浏览器打开这个文件，它会自动玩到 100 分然后停止。');