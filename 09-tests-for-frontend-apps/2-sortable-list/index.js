import { createElement, getSubElements } from '../../util/domUtil.js';

const DRAGGING_CLASS_NAME = 'sortable-list__item_dragging';

export default class SortableList {
  constructor({
    items = []
  }) {
    this.items = items;
    this.element = createElement(this.createTemplate());
    this.addItems();
    this.addEventHandlers();
  }

  addItems() {
    this.items.forEach(i => {
      i.classList.add('sortable-list__item');
      this.element.appendChild(i);
    });
  }

  createTemplate() {
    return `
      <ul class="sortable-list">        
      </ul>
    `;
  }

  moveDraggingElementTo(e) {
    this.draggingElement.style.left = `${e.clientX - this.dragDisplacement.x}px`;
    this.draggingElement.style.top = `${e.clientY - this.dragDisplacement.y}px`;
  }

  setPlaceholderIndex(index) {
    const elementBefore = index < this.element.children.length ? this.element.children[index] : null;
    if (elementBefore === this.placeholderElement ||
       this.placeholderElement.nextSibling === elementBefore) {
      return;
    }    
    this.element.insertBefore(this.placeholderElement, elementBefore);
  }

  handleBeginDrag(e) {
    this.draggingElement = e.target.closest('[data-grab-handle]')?.closest('.sortable-list__item');
    if (!this.draggingElement) {
      return;
    }
    this.dragDisplacement = {
      x: e.clientX - this.draggingElement.getBoundingClientRect().x,
      y: e.clientY - this.draggingElement.getBoundingClientRect().y,
    };
    this.draggingElement.style.width = `${this.draggingElement.offsetWidth}px`;
    this.draggingElement.style.height = `${this.draggingElement.offsetHeight}px`;
    this.draggingElement.classList.add(DRAGGING_CLASS_NAME);
    this.placeholderElement = document.createElement('li');
    this.placeholderElement.classList.add('sortable-list__placeholder');
    this.placeholderElement.style.height = this.draggingElement.style.height;
    this.draggingElement.after(this.placeholderElement);
    this.moveDraggingElementTo(e);
    document.addEventListener('pointermove', this.handleDocumentPointerMove);
    document.addEventListener('pointerup', this.handleDocumentPointerUp);
  }

  handleDrag(e) {
    this.moveDraggingElementTo(e);
    if (e.clientY < this.element.firstElementChild.getBoundingClientRect().top) {
      this.setPlaceholderIndex(0);
    } else if (e.clientY > this.element.lastElementChild.getBoundingClientRect().bottom) {
      this.setPlaceholderIndex(this.element.children.length);
    } else {
      for (let i = 0; i < this.element.children.length; i++) {
        const childElement = this.element.children[i];
        if (childElement !== this.draggingElement &&
            childElement !== this.placeholderElement &&
            e.clientY > childElement.getBoundingClientRect().top &&
            e.clientY < childElement.getBoundingClientRect().bottom) {
          this.setPlaceholderIndex(i + Math.floor(
            (e.clientY - childElement.getBoundingClientRect().top) /
            (childElement.offsetHeight / 2)
          ));
          break;
        }
      }
    }
  }

  handleEndDrag(e) {
    this.draggingElement.classList.remove(DRAGGING_CLASS_NAME);
    this.draggingElement.style.width = null;
    this.draggingElement.style.height = null;
    this.draggingElement.style.left = null;
    this.draggingElement.style.top = null;
    this.placeholderElement.replaceWith(this.draggingElement);
    document.removeEventListener('pointermove', this.handleDocumentPointerMove);
    document.removeEventListener('pointerup', this.handleDocumentPointerUp);
  }

  handleRemove(e) {
    const elementToDelete = e.target.closest('[data-delete-handle]')?.closest('.sortable-list__item');
    if (elementToDelete) {
      elementToDelete.remove();
    }
  }

  handlePointerDown = (e) => {
    const dragHandle = e.target.closest('[data-grab-handle]');
    if (dragHandle) {
      e.preventDefault();
      this.handleBeginDrag(e);
    }
    const deleteHandle = e.target.closest('[data-delete-handle]');
    if (deleteHandle) {
      this.handleRemove(e);
    }
  }

  handleDocumentPointerMove = (e) => {
    this.handleDrag(e);
  }

  handleDocumentPointerUp = (e) => {
    this.handleEndDrag(e);
  }

  addEventHandlers() {
    this.element.addEventListener('pointerdown', this.handlePointerDown);
  }

  removeEventHandlers() {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventHandlers();
    this.remove();
  }

}
