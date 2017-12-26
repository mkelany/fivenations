/* global window */
import Graphics from '../common/Graphics';
import PlanetAreaGenerator from './PlanetAreaGenerator';

const ns = window.fivenations;
let sprites;

function DeepSpaceLayer(map) {
  this.setMap(map);
  this.setGame(map.getGame());
  this.createTexture();
  this.createSprites();
  this.createSpaceObjects();
}

DeepSpaceLayer.prototype = {
  spaceObjects: [],

  setMap(map) {
    if (!map) throw new Error('Map instance must be passed as first parameter!');
    this.map = map;
  },

  setGame(game) {
    if (!game) throw new Error('Phaser.Game instance must be passed as first parameter!');
    this.game = game;
  },

  createTexture() {
    const { width, height } = ns.window;

    this.texture = this.game.add.renderTexture(width, height, 'Starfield.Stars.Texture');

    const container = this.game.add.image(0, 0, this.texture);
    container.fixedToCamera = true;

    Graphics.getInstance()
      .getGroup('starfield')
      .add(container);
  },

  createSprites() {
    if (sprites) return;
    sprites = {
      cloud1: this.game.make.sprite(0, 0, 'starfield.clouds.bg.type-1'),
      cloud2: this.game.make.sprite(0, 0, 'starfield.clouds.bg.type-2'),
      meteorites: this.game.make.sprite(0, 0, 'starfield.meteorites'),
      planet1: this.game.make.sprite(0, 0, 'starfield.planets.type-1'),
      planet2: this.game.make.sprite(0, 0, 'starfield.planets.type-2'),
    };
  },

  createSpaceObjects(savedData) {
    if (savedData) {
      const SpaceObjectLoader = () => {};
      this.loadSpaceObjects(new SpaceObjectLoader(this, savedData));
    } else {
      this.generateSpaceObjects(new PlanetAreaGenerator(this));
    }
    this.sortSpaceObjects();
  },

  generateSpaceObjects(generator) {
    if (!generator) throw new Error('Invalid generator instance!');
    generator.generate();
    this.spaceObjects = generator.getSpaceObjects();
  },

  loadSpaceObjects(loader) {
    if (!loader) throw new Error('Invalid loader instance!');
    loader.load();
    this.spaceObjects = loader.getSpaceObjects();
  },

  sortSpaceObjects() {
    this.spaceObjects.sort((a, b) => a.z - b.z);
  },

  update() {
    for (let i = 0, l = this.spaceObjects.length; i < l; i += 1) {
      this.spaceObjects[i].update(this.texture, this.game, i === 0);
    }
  },

  getGame() {
    return this.game;
  },

  getMap() {
    return this.map;
  },

  getSprites() {
    return sprites;
  },
};

export default DeepSpaceLayer;
