import fetchJson from './utils/fetch-json.js';
import SortableTableV2 from '../../06-events-practice/1-sortable-table-v2/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const PAGE_SIZE = 30;
const SCROLL_THRESCHOLD_TO_LOAD_DATA = 100;

export default class SortableTable extends SortableTableV2 {

  currentPage = 1;

  constructor(headersConfig, {
    url = "",
    data = [],
    isSortLocally = false,
    ...dataConfig } = {}) {
    super(headersConfig, { isSortLocally, ...dataConfig });
    this.dataLoaded = false;
    this.url = new URL(url, BACKEND_URL);
    this.init();
  }

  init() {
    if (typeof this.url === 'undefined') {
      return; // Called from the base class, skip for now
    }
    super.init();
    this.render();
  }

  prepareSortedData() {
    if (this.isSortLocally) {
      super.prepareSortedData();
    }
    else {
      // Data has been sorted on server, do nothing
      this.sortedData = this.data;
    }
  }

  async fetchData() {
    const effectiveUrl = new URL(this.url);
    effectiveUrl.searchParams.set("_start", (this.currentPage - 1) * PAGE_SIZE);
    effectiveUrl.searchParams.set("_end", this.currentPage * PAGE_SIZE);
    if (!this.isSortLocally && this.sortField && this.sortOrder) {
      effectiveUrl.searchParams.set("_sort", this.sortField);
      effectiveUrl.searchParams.set("_order", this.sortOrder);
    }
    const newData = await fetchJson(effectiveUrl);
    this.data = [...this.data, ...newData];
    this.currentPage++;
  }

  async render() {
    this.isLoading = true;
    this.update();
    await this.fetchData();
    this.isLoading = false;
    this.prepareSortedData();
    this.update();
    console.log('after render', this.data, this.subElements.body.children.length);
  }

  async sortOnServer(id, order) {
    if (this.isLoading) {
      return;
    }
    this.sortField = id;
    this.sortOrder = order;
    this.currentPage = 1;
    this.data = [];
    this.sortedData = [];
    await this.render();
  }

  handleWindowScroll = async () => {
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
    if (windowRelativeBottom < document.documentElement.clientHeight + SCROLL_THRESCHOLD_TO_LOAD_DATA) {
      if (!this.isLoading) {
        await this.render();
      }

    }
  }

  addEventHandlers() {
    super.addEventHandlers();
    window.addEventListener('scroll', this.handleWindowScroll);
  }

  removeEventHandlers() {
    window.removeEventListener('scroll', this.handleWindowScroll);
    super.removeEventHandlers();
  }
}
