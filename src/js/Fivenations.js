import '../scss/main.scss';

import './globals';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from './common/Const';
import Util from './common/Util';
import Boot from './scenes/Boot';
import MenuPreloader from './scenes/MenuPreloader';
import MainMenu from './scenes/MainMenu';
import GamePreloader from './scenes/GamePreloader';
import Game from './scenes/Game';

const ns = window.fivenations;

let game;

function exposeGameAttributes(params) {
  const { width, height, canvasElmId } = params;
  ns.window = {
    width: width || DEFAULT_CANVAS_WIDTH,
    height: height || DEFAULT_CANVAS_HEIGHT,
    canvasElmId,
  };
}

function exposeCurrentVersion() {
  ns.version = process.env.VERSION;
}

function initPhaserGame(params) {
  const { width, height, canvasElmId } = params;
  game = new Phaser.Game(
    width || DEFAULT_CANVAS_WIDTH,
    height || DEFAULT_CANVAS_HEIGHT,
    Phaser.AUTO,
    canvasElmId,
  );
}

function initScenes() {
  game.state.add('boot', Boot);
  game.state.add('menu-preloader', MenuPreloader);
  game.state.add('mainmenu', MainMenu);
  game.state.add('game-preloader', GamePreloader);
  game.state.add('game', Game);
}

export default class App extends Util.EventDispatcher {
  constructor(params) {
    super();
    exposeGameAttributes(params);
    exposeCurrentVersion();
    initPhaserGame(params);
    initScenes();
  }

  start() {
    game.state.start('boot');
  }
}
