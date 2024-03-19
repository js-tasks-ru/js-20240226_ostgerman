import { createElement } from '../../util/domUtil.js';

class Tooltip {

  static #instance;

  element;
  text;
  top = 0;
  left = 0;

  constructor() {
    if (!Tooltip.#instance) {
      Tooltip.#instance = this;
    }
    return Tooltip.#instance;
  }

  initialize() {
    if (this.element) {
      this.destroy();
    }
    this.setAppearanceEventListeners();
  }

  createTemplate() {
    return `<div class="tooltip">${this.text}</div>`;
  }

  render(text) {
    this.text = text;
    this.element = createElement(this.createTemplate());
    document.body.appendChild(this.element);
  }

  setPosition(x, y) {
    this.element.style.left = (x + 10) + 'px';
    this.element.style.top = (y + 5) + 'px';
  }

  handlePointerOver = (event) => {
    if (!event.target.dataset.tooltip) {
      return;
    }
    this.render(event.target.dataset.tooltip);
    this.setPosition(event.clientX, event.clientY);
    this.setPositionEventListeners();
  }

  handlePointerOut = () => {
    this.removePositionEventListeners();
    this.remove();
  }

  handlePointerMove = (event) => {
    this.setPosition(event.clientX, event.clientY);
  }

  setAppearanceEventListeners() {
    document.addEventListener('pointerover', this.handlePointerOver);
    document.addEventListener('pointerout', this.handlePointerOut);
  }

  removeAppearanceEventListeners() {
    document.removeEventListener('pointerout', this.handlePointerOut);
    document.removeEventListener('pointerover', this.handlePointerOver);
  }

  setPositionEventListeners() {
    document.addEventListener('pointermove', this.handlePointerMove);
  }

  removePositionEventListeners() {
    document.removeEventListener('pointermove', this.handlePointerMove);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }

  destroy() {
    this.removePositionEventListeners();
    this.removeAppearanceEventListeners();
    this.remove();
  }

}

export default Tooltip;
