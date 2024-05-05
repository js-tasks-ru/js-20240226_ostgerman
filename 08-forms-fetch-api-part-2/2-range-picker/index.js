import { compareDates, getDaysOfWeek, getFirstDayOfMonthDate, getLastDayOfMonthDate, getMonthName, getNextMonthDate } from '../../util/date.js';
import { createElement, getSubElements } from '../../util/domUtil.js';

const VISIBILITY_CLASS = 'rangepicker_open';

export default class RangePicker {
  constructor({
    from = Date.now(),
    to = Date.now(),
    locale = 'ru-RU',
    startingDayOfWeek = 1,
  } = {}) {
    this.from = from;
    this.to = to;
    this.startingDayOfWeek = startingDayOfWeek;
    this.locale = locale;
    this.startingMonth = getFirstDayOfMonthDate(from);
    this.displayDate = this.from;
    this.element = createElement(this.createTemplate());
    this.subElements = getSubElements(this.element);
    this.addEventHandlers();
  }

  getDateItemClass(date) {
    const classes = ['rangepicker__cell'];
    const compareFrom = compareDates(date, this.from);
    const compareTo = compareDates(date, this.to);
    if (compareFrom === 0) {
      classes.push('rangepicker__selected-from');
    }
    if (compareTo === 0) {
      classes.push('rangepicker__selected-to');
    }
    if (compareFrom > 0 && compareTo < 0 ||
      compareFrom < 0 && compareTo > 0) {
      classes.push('rangepicker__selected-between');
    }
    return classes.join(' ');
  }

  createMonthTemplate(monthDate) {
    return `
    <div class="rangepicker__month-indicator">          
          <time datetime="${getMonthName(monthDate, this.locale)}">${getMonthName(monthDate, this.locale)}</time>
        </div>
        <div class="rangepicker__day-of-week">
          ${getDaysOfWeek(this.startingDayOfWeek, this.locale).map(d => `<div>${d}</div>`).join('')}
        </div>        
        <div class="rangepicker__date-grid">
          ${Array(getLastDayOfMonthDate(monthDate).getDate())
        .fill()
        .map((_, i) => new Date(monthDate.getFullYear(), monthDate.getMonth(), i + 1))
        .map((date, i) => {
          return `<button type="button" 
                          ${i === 0 ? `style="--start-from: ${date.getDay() - this.startingDayOfWeek + 1}"` : ""}                          
                          data-value="${date.toString()}">${i + 1}</button>
                  `;
        }).join('')}          
        </div>
    `;
  }

  createSelectorTemplate() {
    return `
    <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
        ${this.createMonthTemplate(this.startingMonth)}
      </div>
      <div class="rangepicker__calendar">
        ${this.createMonthTemplate(getNextMonthDate(this.startingMonth))}
      </div>
      </div>`;
  }

  createInputTemplate() {
    return `
      <span data-element="from">${this.from.toLocaleDateString(this.locale)}</span> -
      <span data-element="to">${this.to.toLocaleDateString(this.locale)}</span>
    `;
  }

  createTemplate() {
    return `
    <div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        ${this.createInputTemplate()}
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
  </div>`;
  }

  updateSelection() {
    [...this.element.querySelectorAll('[data-value]')].forEach(el => {
      el.className = this.getDateItemClass(new Date(el.dataset.value));
    });
  }


  show() {
    this.redrawCalendar();
    this.element.classList.add(VISIBILITY_CLASS);
  }

  hide() {
    this.element.classList.remove(VISIBILITY_CLASS);
  }

  isShown() {
    return this.element.classList.contains(VISIBILITY_CLASS);
  }

  redrawCalendar() {
    this.subElements.selector.innerHTML = this.createSelectorTemplate();
    this.updateSelection();
  }

  redrawDates() {
    const calendars = this.element.querySelectorAll('.rangepicker__calendar');
    calendars[0].innerHTML = this.createMonthTemplate(this.startingMonth);
    calendars[1].innerHTML = this.createMonthTemplate(getNextMonthDate(this.startingMonth));
    this.updateSelection();
  }

  redrawInput() {
    this.subElements.input.innerHTML = this.createInputTemplate();
  }

  setMonth(forward) {
    this.startingMonth.setMonth(this.startingMonth.getMonth() + (forward ? 1 : -1));
    this.redrawDates();
  }

  handleDocumentClick = (e) => {
    if (this.isShown() && !this.element.contains(e.target)) {
      this.hide();
    }
  }

  handleClick = (e) => {

    if (this.subElements.input.contains(e.target)) {
      if (!this.isShown()) {
        this.show();
      } else {
        this.hide();
      }
      return;
    }

    if (this.element.querySelector('.rangepicker__selector-control-left').contains(e.target)) {
      this.setMonth(false);
      return;
    }

    if (this.element.querySelector('.rangepicker__selector-control-right').contains(e.target)) {
      this.setMonth(true);
      return;
    }

    const dateButton = e.target.closest('[data-value]');
    if (!dateButton) {
      return;
    }
    const selectedDate = new Date(e.target.dataset.value);
    if (this.from !== this.to) {
      this.from = selectedDate;
      this.to = selectedDate;
    } else if (this.from) {
      this.to = selectedDate;
      this.hide();
      this.redrawInput();
      const customEvent = new CustomEvent("date-select", {
        detail: {
          from: this.from,
          to: this.to
        }
      });
      this.element.dispatchEvent(customEvent);
    }
    this.updateSelection();
  }

  addEventHandlers() {
    this.element.addEventListener('click', this.handleClick);
    document.addEventListener('click', this.handleDocumentClick, true);

  }

  removeEventHandlers() {
    this.element.removeEventListener('click', this.handleClick);
    document.removeEventListener('click', this.handleDocumentClick, true);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventHandlers();
    this.remove();
  }

}
