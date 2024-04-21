import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import { createElement, getSubElements } from '../../util/domUtil.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru/';
const CATEGORIES_URL_WITH_PARAMS = 'api/rest/categories?_sort=weight&_refs=subcategory';
const PRODUCTS_URL = 'api/rest/products';
const IMAGE_UPLOAD_URL = 'https://api.imgur.com/3/image';

export default class ProductForm {
  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    await this.loadCategories();
    if (this.productId) {
      await this.loadProduct();
    }
    else {
      this.product = {
        images: []
      };
    }
    this.element = createElement(this.createTemplate());
    this.subElements = getSubElements(this.element);
    this.createEventHandlers();
    return this.element;
  }

  async loadProduct() {
    const productURL = new URL(PRODUCTS_URL, BACKEND_URL);
    productURL.searchParams.set('id', this.productId);
    const products = await fetchJson(productURL);
    this.product = products[0];
  }

  async loadCategories() {
    const categories = await fetchJson(new URL(CATEGORIES_URL_WITH_PARAMS, BACKEND_URL));
    this.subCategories = categories.flatMap(
      cat => cat.subcategories.map(
        subcat => ({ id: subcat.id, label: `${cat.title} > ${subcat.title}` })
      ));
  }

  createCategoriesTemplate() {
    return this.subCategories.map(subCategory => `
      <option value="${subCategory.id}"${subCategory.id === this.product?.subcategory ? " selected" : ""}>${escapeHtml(subCategory.label)}</option>
    `).join('');
  }


  createImageTemplate(img) {
    return `
    <li class="products-edit__imagelist-item sortable-list__item" style="" data-image-list-item>
      <input type="hidden" name="url" value="${img.url}">
      <input type="hidden" name="source" value="${img.source}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${img.url}" referrerpolicy="no-referrer">
        <span>${img.source}</span>
      </span>
      <button type="button" data-image-delete>
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>
    `;
  }

  createImagesTemplate() {
    return this.product?.images.map(this.createImageTemplate).join('');
  }

  createTemplate() {
    return `      
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <input type="hidden" name="id" value="${this.productId}">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${escapeHtml(this.product?.title ?? "")}">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${escapeHtml(this.product?.description ?? "")}</textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list" data-element="imageList">
                ${this.createImagesTemplate()}                
              </ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImageButton">
              <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory">
              ${this.createCategoriesTemplate()}              
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" class="form-control" placeholder="100" value="${this.product?.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.product?.discount}">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.product?.quantity}">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
              <option value="1"${this.product?.status === 1 ? " selected" : ""}>Активен</option>
              <option value="0"${this.product?.status === 0 ? " selected" : ""}>Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline" data-element="saveProductButton">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async save() {
    this.subElements.saveProductButton.disabled = true;
    this.subElements.saveProductButton.classList.add('is-loading');
    try {
      const formData = new FormData(this.subElements.productForm);
      formData.delete('url');
      formData.delete('source');
      const productToSave = Object.fromEntries(formData);
      productToSave.id = this.productId;
      productToSave.discount = parseInt(productToSave.discount);
      productToSave.price = parseInt(productToSave.price);
      productToSave.quantity = parseInt(productToSave.quantity);
      productToSave.status = parseInt(productToSave.status);
      productToSave.images = [];
      [...this.subElements.imageList.children].forEach(li => {
        productToSave.images.push({
          url: li.querySelector('[name="url"]').value,
          source: li.querySelector('[name="source"]').value,
        });
      });      
      const productURL = new URL(PRODUCTS_URL, BACKEND_URL);
      await fetchJson(productURL, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productToSave),
      });
      const customEvent = this.productId ? new CustomEvent("product-updated") : new CustomEvent("product-saved", {
        detail: this.productId
      });
      this.element.dispatchEvent(customEvent);
    }
    finally {
      this.subElements.saveProductButton.disabled = false;
      this.subElements.saveProductButton.classList.remove('is-loading');
    }
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    await this.save();
  }

  handleImageUpload = (e) => {
    const fileUpload = document.createElement('input');
    fileUpload.type = 'file';
    fileUpload.accept = 'image/*';
    fileUpload.addEventListener('change', this.handleImageFileSelect);
    fileUpload.hidden = true;
    document.body.appendChild(fileUpload);
    fileUpload.click();
  }

  handleImageFileSelect = async (e) => {
    const fileUpload = e.target;
    if (!fileUpload.files.length) {
      return;
    }
    this.subElements.uploadImageButton.disabled = true;
    this.subElements.uploadImageButton.classList.add('is-loading');
    try {
      const image = fileUpload.files[0];
      const formData = new FormData();
      formData.append('image', image);
      const uploadResult = await fetchJson(IMAGE_UPLOAD_URL, {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
      });
      const newImage = {
        url: uploadResult.data.link,
        source: image.name,
      };
      const newImageElement = createElement(
        this.createImageTemplate(newImage)
      );      
      this.subElements.imageList.appendChild(newImageElement);
    }
    finally {
      this.subElements.uploadImageButton.disabled = false;
      this.subElements.uploadImageButton.classList.remove('is-loading');
      fileUpload.removeEventListener('change', this.handleImageFileSelect);
      fileUpload.remove();
    }
  }

  handleImageDelete = (e) => {
    const deleteButton = e.target.closest('[data-image-delete]');
    if (!deleteButton) {
      return;
    }
    const imageListElement = deleteButton.closest('[data-image-list-item]');        
    imageListElement.remove();
  }

  createEventHandlers() {
    this.subElements.productForm.addEventListener('submit', this.handleSubmit);
    this.subElements.uploadImageButton.addEventListener('click', this.handleImageUpload);
    this.subElements.imageList.addEventListener('click', this.handleImageDelete);
  }

  removeEventHandlers() {
    this.subElements.productForm.removeEventListener('submit', this.handleSubmit);
    this.subElements.uploadImageButton.removeEventListener('click', this.handleImageUpload);
    this.subElements.imageList.removeEventListener('click', this.handleImageDelete);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventHandlers();
    this.remove();
  }
}
