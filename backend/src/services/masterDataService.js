const masterDataRepository = require('../repositories/masterDataRepository');

class MasterDataService {
  async getDropdowns(category) {
    if (category) {
      return await masterDataRepository.findByCategory(category);
    }
    return await masterDataRepository.findAll();
  }

  async addDropdownItem(data) {
    const id = await masterDataRepository.create(data);
    return id;
  }

  async toggleActive(id, is_active) {
    await masterDataRepository.toggleActive(id, is_active);
  }
}

module.exports = new MasterDataService();
