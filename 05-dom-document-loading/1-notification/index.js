// TODO: this does not belong to NotificationMessage,
// share the code across components
const createElement = template => {
  const element = document.createElement('div');
  element.innerHTML = template;
  return element.firstElementChild;
};

export default class NotificationMessage {

  static lastNotification;

  duration;
  type;
  message;

  constructor(message, {
    duration = 1000,
    type = "success"
  } = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.element = createElement(this.createTemplate());
  }

  show(element = document.body) {
    if (NotificationMessage.lastNotification) {
      NotificationMessage.lastNotification.destroy();
    }
    NotificationMessage.lastNotification = this;
    element.append(this.element);
    this.setTimer();
  }

  remove() {
    this.element.remove();
  }

  setTimer() {
    this.timer = setTimeout(() => this.destroy(), this.duration);
  }

  clearTimer() {
    clearTimeout(this.timer);
  }

  destroy() {
    this.clearTimer();
    this.remove();
    NotificationMessage.lastNotification = null;
  }

  durationMsToSecondsString() {
    return (this.duration / 1000).toFixed(0) + 's';
  }

  createNotificationClasses() {
    return `notification ${this.type}`;
  }

  createTemplate() {
    return `
    <div class="${this.createNotificationClasses()}" style="--value:${this.durationMsToSecondsString()}">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>
    `;
  }


}
