const WHITE = '#F5F5F5';
const BLACK = "#000";

const Gobang = {
  canvas: null,
  ctx: null,
  unit: 24, // 单位像素
  cx: null, // canvas 位置
  cy: null, // canvas 位置
  board: [], // 棋盘列表
  isFirst: false, // 是否先手
  playStack: [], // 玩家下棋栈
  pcStack: [], // 电脑下棋栈
  step: 0, // 步数
  wins: [], // 所有赢法
  playerWins: [], // 玩家赢法
  pcWins: [], // 电脑赢法
  isOver: false, // 游戏是否结束
  isPlay: true, // 是否是玩家回合
  count: 0, // 赢法总数
  mounted() {
    this.canvas = document.getElementById('gobang');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.unit * 15;
    this.canvas.height = this.unit * 15;
    this.cx = this.canvas.getBoundingClientRect().left;
    this.cy = this.canvas.getBoundingClientRect().top;
    this.bind();
  },
  init() {
    this.getWins();
    for (let i = 0; i < 15; i++) {
      this.board[i] = [];
      for (let j = 0; j < 15; j++) {
        this.board[i][j] = {
          x: this.unit / 2 + i * this.unit,
          y: this.unit / 2 + j * this.unit,
          piece: false,
          active: false,
        };
      }
    }
    if (!this.isFirst) {
      this.step++;
      this.board[7][7].piece = BLACK;
      this.pcPlaying(7, 7);
    } else {
      this.draw();
    }
  },
  getWins() { // 获取所有赢法
    const wins = [];
    const winMap = {};
    for (let i = 0; i < 15; i++) {
      wins[i] = [];
      for (let j = 0; j < 15; j++) {
        wins[i][j] = [];
      }
    }

    // 横线赢法
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 11; j++) {
        const steps = [];
        for (let k = 0; k < 5; k++) {
          wins[j + k][i][this.count] = true;
          steps.push(`${j + k},${i}`);
        }
        winMap[this.count] = {
          steps,
          position: 1, // 1: 水平方向
        };
        this.count++;
      }
    }

    // 竖线赢法
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 11; j++) {
        const steps = [];
        for (let k = 0; k < 5; k++) {
          wins[i][j + k][this.count] = true;
          steps.push(`${i},${j + k}`);
        }
        winMap[this.count] = {
          steps,
          position: 2, // 2: 垂直方向
        };
        this.count++;
      }
    }

    // 正斜线赢法
    for (let i = 0; i < 11; i++) {
      for (let j = 0; j < 11; j++) {
        const steps = [];
        for (let k = 0; k < 5; k++) {
          wins[i + k][j + k][this.count] = true;
          steps.push(`${i + k},${j + k}`);
        }
        winMap[this.count] = {
          steps,
          position: 3, // 3: 正斜线方向
        };
        this.count++;
      }
    }

    // 反斜线赢法
    for (let i = 0; i < 11; i++) {
      for (let j = 14; j > 3; j--) {
        const steps = [];
        for (let k = 0; k < 5; k++) {
          wins[i + k][j - k][this.count] = true;
          steps.push(`${i + k},${j - k}`);
        }
        winMap[this.count] = {
          steps,
          position: 4, // 4: 反斜线方向
        };
        this.count++;
      }
    }
    this.wins = wins;

    for (let i = 0; i < this.count; i++) {
      this.playerWins[i] = {
        number: 0,
        steps: winMap[i].steps,
        position: winMap[i].position,
      };
      this.pcWins[i] = {
        number: 0,
        steps: winMap[i].steps,
        position: winMap[i].position,
      };;
    }
  },
  draw() { // 画图
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBoard();
    this.drawPieces();
  },
  drawBoard() { // 画棋盘
    this.ctx.fillStyle = 'rgb(249, 214, 91)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < 15; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.unit + this.unit / 2, this.unit / 2);
      this.ctx.lineTo(i * this.unit + this.unit / 2, this.unit * 14.5);
      this.ctx.stroke();
      this.ctx.moveTo(this.unit / 2, i * this.unit + this.unit / 2);
      this.ctx.lineTo(this.unit * 14.5, i * this.unit + this.unit / 2);
      this.ctx.stroke();
    }
  },
  drawPieces() { // 画棋子
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (this.board[i][j].piece) {
          this.drawPiece(this.board[i][j]);
        }
      }
    }
  },
  drawPiece(data) {
    this.ctx.beginPath();
    this.ctx.fillStyle = data.piece;
    this.ctx.arc(data.x, data.y, this.unit / 2, 0, 2 * Math.PI, false);
    this.ctx.fill();
    if (data.active) {
      this.ctx.beginPath();
      this.ctx.fillStyle = 'red';
      this.ctx.arc(data.x, data.y, this.unit / 6, 0, 2 * Math.PI, false);
      this.ctx.fill();
    }
    this.ctx.closePath();
  },
  bind() { // 绑定事件
    this.canvas.addEventListener('touchstart', e => {
      if (this.isOver) {
        return;
      }
      if (!this.isPlay) {
        return;
      }
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const xi = Math.round((x - this.cx - this.unit / 2) / this.unit);
      const yi = Math.round((y - this.cy - this.unit / 2) / this.unit);
      if (!this.board[xi][yi].piece) {
        this.board[xi][yi].piece = this.isFirst ? BLACK : WHITE;
        this.playStack.push(`${xi},${yi}`); // 入栈
        this.step++;
        this.draw();
        for (let k = 0; k < this.count; k++) {
          if (this.wins[xi][yi][k]) { // 查找是否有这种赢法
            this.playerWins[k].number++; // 该赢法加1子
            this.pcWins[k].number = 10; // 玩家占了1子，电脑在该赢法上不可能获胜
            if (this.playerWins[k].number === 5) {
              alert('恭喜，你赢了！');
              this.isOver = true;
            }
          }
        }
        if (!this.isOver) {
          this.isPlay = false; // 交换
          this.pcPlaying();
        }
      }
    });
    document.getElementById('regret').addEventListener('click', this.regret.bind(this));
  },
  pcPlaying(i, j) { // 电脑回合
    this.step++;
    const playScore = [];
    const pcScore = [];
    let max = 0;
    let u = 0;
    let v = 0;
    if (j === undefined && j === undefined) {
      for (let i = 0; i < 15; i++) {
        playScore[i] = [];
        pcScore[i] = [];
        for (let j = 0; j < 15; j++) {
          playScore[i][j] = 0;
          pcScore[i][j] = 0;
        }
      }
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          // 遍历搜索棋盘上每个空位，查询每个空位的赢法
          if (!this.board[i][j].piece) {
            for (var k = 0; k < this.count; k++) {
              if (this.wins[i][j][k]) {
                // 判断每种玩家赢法上有多少子来判断权重
                if (this.playerWins[k].number === 1) {
                  playScore[i][j] += 100;
                }
                if (this.playerWins[k].number === 2) {
                  if (this.checkWins(this.playerWins[k], false)) {
                    playScore[i][j] += 200;
                  } else {
                    playScore[i][j] += 1000;
                  }
                }
                if (this.playerWins[k].number === 3) {
                  if (this.checkWins(this.playerWins[k], false)) { // 检测3个子中是否已经被其他子侵占
                    playScore[i][j] += 400;
                  } else {
                    playScore[i][j] += 1000000;
                  }
                }
                if (this.playerWins[k].number === 4) {
                  playScore[i][j] += 100000000;
                }
                // 判断每种电脑赢法上有多少子来判断权重（进攻优于防守）
                if (this.pcWins[k].number === 1) {
                  if (this.checkWins(this.pcWins[k], true)) {
                    pcScore[i][j] += 100;
                  } else {
                    if (this.pcWins[k].position === 3 || this.pcWins[k].position === 4) {
                      pcScore[i][j] += 260;
                    } else {
                      pcScore[i][j] += 220;
                    }
                  }
                }
                if (this.pcWins[k].number === 2) {
                  if (this.checkWins(this.pcWins[k], true)) {
                    pcScore[i][j] += 220;
                  } else {
                    pcScore[i][j] += 10000;
                  }
                }
                if (this.pcWins[k].number === 3) {
                  if (this.checkWins(this.pcWins[k], true)) {
                    pcScore[i][j] += 100000;
                  } else {
                    pcScore[i][j] += 10000000;
                  }
                }
                if (this.pcWins[k].number === 4) {
                  pcScore[i][j] += 1000000000;
                }
              }
            }
            if (playScore[i][j] + pcScore[i][j] > max) {
              max = playScore[i][j] + pcScore[i][j];
              u = i;
              v = j;
            }
  
          }
        }
      }
    } else {
      u = i;
      v = j;
    }
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        this.board[i][j].active = false;
      }
    }
    // 最终遍历出权重最高的 u,v 点
    this.board[u][v].active = true; // 最新一步
    this.board[u][v].piece = this.isFirst ? WHITE : BLACK;
    this.draw();
    this.pcStack.push(`${u},${v}`);
    for (let k = 0; k < this.count; k++) {
      if (this.wins[u][v][k]) {
        this.pcWins[k].number++;
        this.playerWins[k].number = 10; //这个位置对方不可能赢了
        if (this.pcWins[k].number === 5) {
          alert('计算机赢了');
          this.isOver = true;
        }
      }
    }
    if (!this.isOver) {
      this.isPlay = true;
    }
  },
  checkWins(win, me) { // 检查某个赢法是否被堵死
    const first = win.steps[0]; // 第一子
    const firstX = Number(first.split(',')[0]);
    const firstY = Number(first.split(',')[1]);
    const isFirstSeize = this.board[firstX][firstY].piece ? true : false;
    const last = win.steps[4]; // 最后一子
    const lastX = Number(last.split(',')[0]);
    const lastY = Number(last.split(',')[1]);
    const isLastSeize = this.board[lastX][lastY].piece ? true : false;
    const piece = this.isFirst ? (me ? BLACK : WHITE) : (me ? WHITE : BLACK);
    if (win.position === 1) { // 横线
      if (firstX - 1 < 0) { // 出界
        return false;
      }
      if (lastX + 1 > 14) { // 出界
        return false;
      }
      if (((this.board[firstX - 1][firstY].piece === piece) && isFirstSeize) || ((this.board[lastX + 1][lastY].piece === piece) && isLastSeize)) {
        return true;
      }
    }
    if (win.position === 2) { // 竖线
      if (firstY - 1 < 0) { // 出界
        return false;
      }
      if (lastY + 1 > 14) { // 出界
        return false;
      }
      if (((this.board[firstX][firstY - 1].piece === piece) && isFirstSeize) || ((this.board[lastX][lastY + 1].piece === piece) && isLastSeize)) {
        return true;
      }
    }
    if (win.position === 3) { // 正斜线
      if ((firstX - 1 < 0) || (firstY - 1 < 0)) { // 出界
        return false;
      }
      if ((lastX + 1 > 14) || (lastY + 1 > 14)) { // 出界
        return false;
      }
      if (((this.board[firstX - 1][firstY - 1].piece === piece) && isFirstSeize) || ((this.board[lastX + 1][lastY + 1].piece === piece) && isLastSeize)) {
        return true;
      }
    }
    if (win.position === 4) { // 返斜线
      if ((firstX - 1 < 0) || (firstY + 1 > 14)) { // 出界
        return false;
      }
      if ((lastX + 1 > 14) || (lastY - 1 < 0)) { // 出界
        return false;
      }
      if (((this.board[firstX - 1][firstY + 1].piece === piece) && isFirstSeize) || ((this.board[lastX + 1][lastY - 1].piece === piece) && isLastSeize)) {
        return true;
      }
    }
    return false;
  },
  regret() { // 悔棋
    if (this.step < 7) {
      return;
    }
    this.step -= 2;
    const playerStep = this.playStack.pop();
    const pcStep = this.pcStack.pop();
    this.board[playerStep.split(',')[0]][playerStep.split(',')[1]].piece = false;
    this.board[pcStep.split(',')[0]][pcStep.split(',')[1]].piece = false;
    this.draw();
  },
}

Gobang.mounted();
Gobang.init();