const crypto = require('crypto');
const readline = require('readline-sync');
const chalk = require('chalk');

// Класс генерации случайного ключа
class RandomKeyGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString('hex'); // 256-битный ключ (32 байта)
  }
}

// Класс для генерации HMAC
class HMACGenerator {
  static generateHMAC(key, message) {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
  }
}

// Класс для отображения таблицы и правил
class HelpTable {
  constructor(moves) {
    this.moves = moves;
    this.n = moves.length;
    this.p = Math.floor(this.n / 2);
  }

  // Генерация таблицы выигрышей
  generateTable() {
    console.log(chalk.blue("╔═════════════╦" + this.moves.map(m => m.padEnd(9)).join('╦') + "╗"));
    console.log(chalk.blue("║   v PC/User ║ " + this.moves.join(' ║ ') + " ║"));
    console.log(chalk.blue("╠" + '═'.repeat(12 + (this.n * 10)) + "╣"));

    for (let i = 0; i < this.n; i++) {
      const row = this.moves.map((_, j) => this.getResult(i, j)).join(" ║ ");
      console.log(chalk.blue(`║ ${this.moves[i].padEnd(11)} ║ ${row} ║`));
      if (i < this.n - 1) {
        console.log(chalk.blue("╠" + '═'.repeat(12 + (this.n * 10)) + "╣"));
      }
    }

    console.log(chalk.blue("╚" + '═'.repeat(12 + (this.n * 10)) + "╝"));
  }

  getResult(a, b) {
    const diff = (a - b + this.n) % this.n;
    if (diff === 0) return chalk.yellow('Draw');
    if (diff <= this.p) return chalk.green('Win');
    return chalk.red('Lose');
  }
}

// Класс для определения победителя
class Rules {
  constructor(moves) {
    this.moves = moves;
    this.n = moves.length;
    this.p = Math.floor(this.n / 2);
  }

  getResult(userMoveIndex, computerMoveIndex) {
    const diff = (userMoveIndex - computerMoveIndex + this.n) % this.n;
    if (diff === 0) return 'Draw';
    if (diff <= this.p) return 'Win';
    return 'Lose';
  }
}

// Главная игра
class Game {
  constructor(moves) {
    this.moves = moves;
    this.rules = new Rules(moves);
  }

  start() {
    const key = RandomKeyGenerator.generateKey(); // Генерация случайного ключа
    const computerMoveIndex = Math.floor(Math.random() * this.moves.length);
    const computerMove = this.moves[computerMoveIndex];
    const hmac = HMACGenerator.generateHMAC(key, computerMove);

    console.log(chalk.cyan(`HMAC: ${hmac}`));

    let userMoveIndex;
    do {
      console.log(chalk.yellow('Choose your move:'));
      this.moves.forEach((move, index) => {
        console.log(`${index + 1} - ${move}`);
      });
      console.log('0 - Exit');
      console.log('help - Display help table');
      
      const input = readline.question('Your choice: ');
      if (input === '0') {
        console.log(chalk.red('Exiting game.'));
        return;
      }
      if (input === 'help') {
        const helpTable = new HelpTable(this.moves);
        helpTable.generateTable();
        continue;
      }
      userMoveIndex = parseInt(input) - 1;
    } while (isNaN(userMoveIndex) || userMoveIndex < 0 || userMoveIndex >= this.moves.length);

    const userMove = this.moves[userMoveIndex];
    const result = this.rules.getResult(userMoveIndex, computerMoveIndex);

    console.log(chalk.blue(`Computer chose: ${computerMove}`));
    console.log(chalk.magenta(`You chose: ${userMove}`));
    console.log(chalk.green(`Result: ${result}`));
    console.log(chalk.cyan(`Key: ${key}`)); // Отображение исходного ключа
  }
}

// Пример списка ходов, переданного аргументами
const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 === 0) {
  console.log('Error: Please provide an odd number of moves greater than 1.');
  process.exit(1);
}

// Инициализация и запуск игры
const game = new Game(moves);
game.start();
