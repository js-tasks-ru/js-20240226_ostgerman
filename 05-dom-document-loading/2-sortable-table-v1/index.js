const createElement = template => {
  const element = document.createElement('div');
  element.innerHTML = template;
  return element.firstElementChild;
};

const sortStrings = (a, b) => a.localeCompare(b, ['ru', 'en'], {
  caseFirst: "upper"
});

const sortNumbers = (a, b) => a - b;

const sortFunctions = {
  string: sortStrings,
  number: sortNumbers
};


const typedSort = (arr, field, type, direction) => {
  const invert = direction === 'asc' ? 1 : -1;
  return [...arr].sort((a, b) => invert * sortFunctions[type](a[field], b[field]));
};


export default class SortableTable {

  element;
  subElements;
  sortField;
  sortOrder;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = createElement(this.createTemplate());
    this.subElements = this.getSubElements();
  }

  sort(field, order) {
    if (field === this.sortField && order === this.sortOrder) {
      return;
    }
    const sortColumn = this.getColumnElementById(field);
    if (!sortColumn.dataset.sortable) {
      return;
    }
    this.clearSorting();
    this.setSortingForColumnElement(sortColumn, order);
    this.sortField = field;
    this.sortOrder = order;
    this.getSubElementByType("body").innerHTML = this.createDataRowsTemplate();
  }

  clearSorting() {
    if (this.sortField) {
      const sortColumn = this.getColumnElementById(this.sortField);
      this.setSortingForColumnElement(sortColumn, null);
    }
  }

  setSortingForColumnElement(columnElement, sorting) {
    if (sorting) {
      columnElement.dataset.order = sorting;
    } else {
      columnElement.removeAttribute('data-order');
    }
  }

  getSubElements() {
    return [...this.element.querySelectorAll(`[data-element]`)]
      .reduce((res, node) => res = { [node.dataset.element]: node, ...res }, {});
  }

  getSubElementByType(type) {
    return this.subElements[type];
  }

  getColumnElementById(id) {
    return this.getSubElementByType("header")
      .querySelector(`[data-id=${id}]`);
  }

  getSortedData() {
    if (!this.sortField) {
      return this.data;
    }
    const sortColumn = this.getColumnElementById(this.sortField);
    const sortType = sortColumn.dataset.sorttype;    
    return typedSort(this.data, this.sortField, sortType, this.sortOrder);
  }

  createColumnCellTemplate({ id, title, sortable, sortType }) {
    return `
        <div class="sortable-table__cell" data-id="${id}" 
            data-sortable="${sortable}" data-sortType="${sortType}">
          <span>${title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>
    `;
  }

  createColumnRowTemplate() {
    return this.headerConfig.map(this.createColumnCellTemplate).join('');
  }

  createDataRowCellsTemplate(item) {
    return this.headerConfig.map(({ id, template }) =>
      template ? template(item[id]) : `
      <div class="sortable-table__cell">${item[id]}</div>  
    `).join('');
  }

  createDataRowsTemplate() {
    return this.getSortedData().map(({ id, ...item }) => `
    <a href="/products/${id}" class="sortable-table__row">
      ${this.createDataRowCellsTemplate(item)}
    </a>
    `).join('');
  }

  createTemplate() {
    return `
    <div class="sortable-table">
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

