import SortableTableV1 from '../../05-dom-document-loading/2-sortable-table-v1/index.js';

export default class SortableTable extends SortableTableV1 {
  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = true,
  } = {}) {
    super(headersConfig, data);
    this.isSortLocally = isSortLocally;
    this.addEventHandlers();
    if (sorted.id) {
      this.sort(sorted.id, sorted.order);
    }    
  }

  sort(field, order) {    
    if (this.isSortLocally) {
      this.sortOnClient(field, order);    
    } else {
      this.sortOnServer(field, order);
    }
    
  }

  sortOnClient(field, order) {
    super.sort(field, order);
  }

  sortOnServer(field, order) {
    // TODO
  }

  handleHeaderPointerDown = (event) => {    
    const columnCell = event.target.closest('[data-sortable="true"]');
    if (columnCell) {                  
      this.sort(columnCell.dataset.id, (columnCell.dataset.order ?? 'asc') === 'asc' ? 'desc' : 'asc');
    }
  }

  addEventHandlers() {
    this.getSubElementByType('header').addEventListener('pointerdown', this.handleHeaderPointerDown);
  }

  removeEventHandlers() {
    this.getSubElementByType('header').removeEventListener('pointerdown', this.handleHeaderPointerDown);
  }

  destroy() {
    this.removeEventHandlers();
    super.destroy();
  }
}
