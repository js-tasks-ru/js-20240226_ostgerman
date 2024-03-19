export const createElement = template => {
  const element = document.createElement('div');
  element.innerHTML = template;
  return element.firstElementChild;
};

export const getSubElements = element => {
  return [...element.querySelectorAll(`[data-element]`)]
    .reduce((res, node) => res = { [node.dataset.element]: node, ...res }, {});
}