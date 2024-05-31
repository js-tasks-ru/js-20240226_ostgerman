import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';
import { createElement, getSubElements } from '../../util/domUtil.js';

import fetchJson from './utils/fetch-json.js';
import { getFirstDayOfMonthDate, getLastDayOfMonthDate } from '../../util/date.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  element;

  constructor() {
  }

  createTemplate() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }

  addChart(chartName, chartParams) {
    const chart = new ColumnChart(chartParams);
    this.subElements[chartName].append(chart.element);
    this.charts.push(chart);
  }

  createBestsellersUrl({ from, to }) {
    const url = new URL('api/dashboard/bestsellers', BACKEND_URL);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());
    return url;
  }

  async render() {

    const now = new Date();
    const initialRange = {
      from: getFirstDayOfMonthDate(now),
      to: getLastDayOfMonthDate(now),
    };

    this.charts = [];

    this.element = createElement(this.createTemplate());
    this.subElements = getSubElements(this.element);

    this.rangePicker = new RangePicker(initialRange);
    this.subElements.rangePicker.append(this.rangePicker.element);

    this.addChart('ordersChart', {
      label: 'Заказы',
      url: '/api/dashboard/orders',
      link: new URL('/orders', BACKEND_URL),
      range: initialRange
    });

    this.addChart('salesChart', {
      label: 'Продажи',
      url: '/api/dashboard/sales',
      formatHeading: data => '$' + data,
      range: initialRange
    });

    this.addChart('customersChart', {
      label: 'Клиенты',
      url: '/api/dashboard/customers',
      range: initialRange
    });

    this.sortableTable = new SortableTable(header, {
      url: this.createBestsellersUrl(initialRange),
    });
    this.subElements.sortableTable.append(this.sortableTable.element);

    this.createEventHandlers();
    return this.element;
  }

  handleDateSelected = (e) => {
    const { from, to } = e.detail;
    this.charts.forEach(c => c.loadData(from, to));
    this.sortableTable.url = this.createBestsellersUrl({ from, to });
    const { start, end } = this.sortableTable;
    const { id, order } = this.sortableTable.sorted;
    this.sortableTable.sortOnServer(id, order, start, end);
  }

  createEventHandlers() {
    this.rangePicker.element.addEventListener('date-select', this.handleDateSelected);
  }

  removeEventHandlers() {
    this.rangePicker.element.removeEventListener('date-select', this.handleDateSelected);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventHandlers();
    this.remove();
  }


}
