import apiClient from './api.service';

export const catalogService = {
  /**
   * Lấy danh sách sản phẩm
   */
  async getProducts() {
    return apiClient.get('/catalog/products');
  },

  /**
   * Lấy danh sách danh mục
   */
  async getCategories() {
    return apiClient.get('/catalog/categories');
  },

  /**
   * Lấy chi tiết sản phẩm kèm modifiers
   */
  async getProductDetail(id: string) {
    return apiClient.get(`/catalog/products/${id}`);
  }
};

export default catalogService;
