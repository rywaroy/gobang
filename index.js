const Gobang = {
  canvas: null,
  ctx: null,
  unit: 24, // 单位像素
  cx: null, // canvas 位置
  cy: null, // canvas 位置
  board: [], // 棋盘列表
  isFirst: true, // 是否先手
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
        };
      }
    }
    if (!this.isFirst) {
      this.board[7][7].piece = '#000';
    }
    this.draw();
  },
  getWins() { // 获取所有赢法
    const wins = [];
    for (let i = 0; i < 15; i++) {
      wins[i] = [];
      for (let j = 0; j < 15; j++) {
        wins[i][j] = [];
      }
    }
    // 竖线赢法
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 11; j++) {
        for (let k = 0; k < 5; k++) {
          wins[i][j + k][this.count] = true;
        }
        this.count++;
      }
    }

    // 横线赢法
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 11; j++) {
        for (let k = 0; k < 5; k++) {
          wins[j + k][i][this.count] = true;
        }
        this.count++;
      }
    }

    //正斜线赢法
    for (let i = 0; i < 11; i++) {
      for (let j = 0; j < 11; j++) {
        for (let k = 0; k < 5; k++) {
          wins[i + k][j + k][this.count] = true;
        }
        this.count++;
      }
    }

    //反斜线赢法
    for (let i = 0; i < 11; i++) {
      for (let j = 14; j > 3; j--) {
        for (let k = 0; k < 5; k++) {
          wins[i + k][j - k][this.count] = true;
        }
        this.count++;
      }
    }
    this.wins = wins;

    for (let i = 0; i < this.count; i++) {
      this.playerWins[i] = 0;
      this.pcWins[i] = 0;
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
        this.board[xi][yi].piece = this.isFirst ? '#000' : '#F5F5F5';
        this.playStack.push(`${xi},${yi}`); // 入栈
        this.step++;
        this.draw();
        for (let k = 0; k < this.count; k++) {
          if (this.wins[xi][yi][k]) { // 查找是否有这种赢法
            this.playerWins[k]++; // 该赢法加1子
            this.pcWins[k] = 10; // 玩家占了1子，电脑在该赢法上不可能获胜
            if (this.playerWins[k] === 5) {
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
    })
  },
  pcPlaying() { // 电脑回合
    const playScore = [];
    const pcScore = [];
    let max = 0;
    let u = 0;
    let v = 0;
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
              if (this.playerWins[k] === 1) {
                playScore[i][j] += 200;
              }
              if (this.playerWins[k] === 2) {
                playScore[i][j] += 400;
              }
              if (this.playerWins[k] === 3) {
                playScore[i][j] += 2000;
              }
              if (this.playerWins[k] === 4) {
                playScore[i][j] += 10000;
              }
              // 判断每种电脑赢法上有多少子来判断权重（进攻优于防守）
              if (this.pcWins[k] === 1) {
                pcScore[i][j] += 220;
              }
              if (this.pcWins[k] === 2) {
                pcScore[i][j] += 420;
              }
              if (this.pcWins[k] === 3) {
                pcScore[i][j] += 2100;
              }
              if (this.pcWins[k] === 4) {
                pcScore[i][j] += 20000;
              }
            }
          }
          // 判断每步玩家的权重分，记录最大的权重分
          if (playScore[i][j] > max) {
            max = playScore[i][j];
            u = i;
            v = j;
          } else if (playScore[i][j] == max) { // 如果权重相同，判断电脑的权重分
            if (pcScore[i][j] > pcScore[u][v]) {
              u = i;
              v = j;
            }
          }
          // 判断每步电脑的权重分，记录最大的权重分
          if (pcScore[i][j] > max) {
            max = pcScore[i][j];
            u = i;
            v = j;
          } else if (pcScore[i][j] == max) { // 如果权重相同，判断玩家的权重分
            if (playScore[i][j] > playScore[u][v]) {
              u = i;
              v = j;
            }
          }

        }
      }
    }

    // 最终遍历出权重最高的 u,v 点
    console.log(u, v);
    this.board[u][v].piece = this.isFirst ? '#F5F5F5' : '#000';
    this.step++;
    this.draw();
    this.pcStack.push(`${u},${v}`);
    for (let k = 0; k < this.count; k++) {
      if (this.wins[u][v][k]) {
        this.pcWins[k]++;
        this.playerWins[k] = 10; //这个位置对方不可能赢了
        if (this.pcWins[k] === 5) {
          alert('计算机赢了');
          this.isOver = true;
        }
      }
    }
    if (!this.isOver) {
      this.isPlay = true;
    }
  },
}

Gobang.mounted();
Gobang.init();