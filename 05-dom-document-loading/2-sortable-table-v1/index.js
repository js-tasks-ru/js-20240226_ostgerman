import { createElement, getSubElements } from '../../util/domUtil.js';
import { typedSort } from '../../util/sort.js';

export default class SortableTable {

  element;
  subElements;
  sortField;
  sortOrder;
  isLoading = false;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.headerConfigElements = headerConfig.reduce((conf, el) => conf = { [el.id]: el, ...conf }, {});    
    this.data = data;
    this.sortedData = data;
    this.init();
  }

  init() {
    this.element = createElement(this.createTemplate());
    this.subElements = getSubElements(this.element);
  }

  sort(field, order) {
    if (field === this.sortField && order === this.sortOrder) {
      return;
    }
    this.sortField = field;
    this.sortOrder = order;
    this.prepareSortedData();
    this.update();
  }

  prepareSortedData() {
    if (!this.sortField) {
      this.sortedData = this.data;
      return;
    }        
    const sortType = this.headerConfigElements[this.sortField].sortType;
    this.sortedData = typedSort(this.data, this.sortField, sortType, this.sortOrder);
  }

  getColumnElementById(id) {
    return this.subElements.header.querySelector(`[data-id=${id}]`);
  }

  getSortDataAttribute(id) {
    if (this.sortField === id) {
      return `data-order="${this.sortOrder}"`;
    }
    return '';
  }

  createColumnRowTemplate() {
    return this.headerConfig.map(({ id, title, sortable, sortType }) =>
      `<div class="sortable-table__cell" data-id="${id}" 
            data-sortable="${sortable}" data-sortType="${sortType}" ${this.getSortDataAttribute(id)}>
          <span>${title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
       </div>
      `).join('');
  }

  createDataRowCellsTemplate(item) {
    return this.headerConfig.map(({ id, template }) =>
      template ? template(item[id]) : `
      <div class="sortable-table__cell">${item[id]}</div>  
    `).join('');
  }

  createDataRowsTemplate() {
    return this.sortedData.map(({ id, ...item }) => `
    <a href="/products/${id}" class="sortable-table__row">
      ${this.createDataRowCellsTemplate(item)}
    </a>
    `).join('');
  }


  createTableClasses() {    
    const effectiveClasses = ['sortable-table'];
    if (this.isLoading) {
      effectiveClasses.push('sortable-table_loading');
    } else if (this.data.length === 0) {
      effectiveClasses.push('sortable-table_empty');
    }
    return effectiveClasses.join(' ');    
  }

  createTemplate() {
    return `
    <div class="${this.createTableClasses()}">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.createColumnRowTemplate()}
      </div>

      <div data-element="body" class="sortable-table__body">
        ${this.createDataRowsTemplate()}
      </div>

      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>

    </div>
    `;
  }

  update() {    
    this.element.classList = this.createTableClasses();
    this.subElements.header.innerHTML = this.createColumnRowTemplate();
    this.subElements.body.innerHTML = this.createDataRowsTemplate();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

