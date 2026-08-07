const masterDataRepository = require('../repositories/masterDataRepository');

class MasterDataService {
  async getDropdowns(category) {
    if (category) {
      return await masterDataRepository.getDropdownsByCategory(category);
    }
    return await masterDataRepository.getAllDropdowns();
  }

  async addDropdown(data) {
    return await masterDataRepository.addDropdown(data);
  }

  async toggleDropdown(id, is_active) {
    await masterDataRepository.toggleDropdown(id, is_active);
  }
}

module.exports = new MasterDataService();
