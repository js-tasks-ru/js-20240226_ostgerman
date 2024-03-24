import fetchJson from './utils/fetch-json.js';
import ColumnChartV1 from '../../04-oop-basic-intro-to-dom/1-column-chart/index.js';
import { getSubElements } from '../../util/domUtil.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends ColumnChartV1 {
  constructor({
    url = '',
    range: {
      from = null,
      to = null
    } = {},
    ...options
  } = {}) {    
    super(options);        
    this.from = from;
    this.to = to;
    this.url = new URL(url, BACKEND_URL);    
    this.subElements = getSubElements(this.element);
    this.update(from, to);
  }

  updateValue() {
    this.value = this.data.reduce((sum, data) => sum + data, 0);    
    this.subElements.header.innerHTML = this.formatHeading(this.value);
  }

  async update(from, to) {
    super.update([]);
    const urlWithParams = new URL(this.url);
    urlWithParams.searchParams.append('from', from);
    urlWithParams.searchParams.append('to', to);
    const rawData = await fetchJson(urlWithParams);
    const data = Object.entries(rawData).map(([_, value]) => value);    
    super.update(data);
    this.updateValue();
    return rawData;
  }
  
  
}
