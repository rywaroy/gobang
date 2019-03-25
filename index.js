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
  init() {
    this.canvas = document.getElementById('gobang');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.unit * 15;
    this.canvas.height = this.unit * 15;
    this.cx = this.canvas.getBoundingClientRect().left;
    this.cy = this.canvas.getBoundingClientRect().top;
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
    this.draw();
    this.bind();
  },
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBoard();
    this.drawPieces();
  },
  drawBoard() {
    this.ctx.fillStyle = 'rgb(249, 214, 91)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for(var i = 0; i < 15; i++){
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.unit + this.unit / 2 , this.unit / 2);
      this.ctx.lineTo(i * this.unit + this.unit / 2 , this.unit * 14.5);
      this.ctx.stroke();
      this.ctx.moveTo(this.unit / 2 , i * this.unit + this.unit / 2);
      this.ctx.lineTo(this.unit * 14.5 , i * this.unit + this.unit / 2);
      this.ctx.stroke();
    }
  },
  drawPieces() {
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
  bind() {
    this.canvas.addEventListener('touchstart', e => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const xi = Math.round((x - this.cx - this.unit / 2) / this.unit);
      const yi = Math.round((y - this.cy - this.unit / 2) / this.unit);
      if (!this.board[xi][yi].piece) {
        this.board[xi][yi].piece = this.isFirst ? '#000' : '#F5F5F5';
        this.playStack.push(`${xi},${yi}`); // 入栈
        this.step++;
        this.draw();
        this.isFirst = !this.isFirst;
      }
    })
  }
}

Gobang.init();