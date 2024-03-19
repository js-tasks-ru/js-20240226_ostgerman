import { createElement, getSubElements } from '../../util/domUtil.js';

export default class DoubleSlider {

  element;

  constructor(
    {
      min = 0,
      max = 100,
      selected: {
        from = min ?? 0,
        to = max ?? 100
      } = {},
      formatValue = value => value,
    } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.from = from;
    this.to = to;
    this.element = createElement(this.createTemplate());
    this.subElements = getSubElements(this.element);
    this.createEventHandlers();
    this.updateSlider();
  }

  getFromToPercentage() {
    return {
      fromPercent: ((this.from - this.min) / (this.max - this.min) * 100).toFixed(5) + '%',
      toPercent: (100 - (this.to - this.min) / (this.max - this.min) * 100).toFixed(5) + '%',
    };
  }

  updateSlider = () => {
    const { toPercent, fromPercent } = this.getFromToPercentage();
    this.subElements.thumbLeft.style.left = fromPercent;
    this.subElements.thumbRight.style.right = toPercent;
    this.subElements.progress.style.left = fromPercent;
    this.subElements.progress.style.right = toPercent;
    this.subElements.from.textContent = this.formatValue((this.from).toFixed(0));
    this.subElements.to.textContent = this.formatValue((this.to).toFixed(0));
  }

  createTemplate() {
    return `
      <div class="range-slider">
        <span data-element="from"></span>
        <div class="range-slider__inner" data-element="inner">
          <span class="range-slider__progress" data-element="progress"></span>
          <span class="range-slider__thumb-left" data-element="thumbLeft"></span>
          <span class="range-slider__thumb-right" data-element="thumbRight"></span>
        </div>
        <span data-element="to"></span>
      </div>
      `;
  }

  handlePointerDown = (event) => {
    if (event.target === this.subElements.thumbLeft ||
      event.target === this.subElements.thumbRight) {
      this.draggingElement = event.target;
      this.element.classList.add('range-slider_dragging');
    }
  }

  handlePointerUp = () => {
    if (this.draggingElement) {
      this.draggingElement = null;
      this.element.classList.remove('range-slider_dragging');
      this.element.dispatchEvent(new CustomEvent('range-select', {
        detail: {
          from: this.from,
          to: this.to
        }
      }));
    }
  }

  handlePointerMove = (event) => {
    if (!this.draggingElement) {
      return;
    }
    const { left, width } = this.subElements.inner.getBoundingClientRect();
    const leftPos = Math.max(event.clientX, left);
    const delta = Math.min(leftPos - left, width);
    const desiredNewValue = delta * (this.max - this.min) / width + this.min;
    if (this.draggingElement === this.subElements.thumbLeft) {
      this.from = Math.min(desiredNewValue, this.to);
    } else if (this.draggingElement === this.subElements.thumbRight) {
      this.to = Math.max(desiredNewValue, this.from);
    }
    this.updateSlider();
  }

  createEventHandlers() {
    this.element.addEventListener('pointerdown', this.handlePointerDown);
    document.addEventListener('pointerup', this.handlePointerUp);
    document.addEventListener('pointermove', this.handlePointerMove);
  }

  removeEventHandlers() {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    document.removeEventListener('pointerup', this.handlePointerUp);
    document.removeEventListener('pointermove', this.handlePointerMove);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventHandlers();
    this.remove();
  }

}
