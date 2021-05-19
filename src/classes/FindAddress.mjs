/**
 * Returns bunch of information about address
 */
export default class GetAddressInfo {
  constructor({ dadataService }) {
    this.dadataService = dadataService;
  }

  async process({ address }) {
    try {
      return this.dadataService.getAddressInfo(address);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async schema() {
    return null;
  }
}
