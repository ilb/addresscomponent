/**
 * Converts lat & lon coordinates to address
 */
export default class GetAddressByCoordinates {
  constructor({ dadataService }) {
    this.dadataService = dadataService;
  }

  async process({ lat, lon, ...restParams }) {
    try {
      const addresses = await this.dadataService.getAddressesFromCoords({ lat, lon }, restParams);
      if (addresses && addresses.length) {
        return addresses[0];
      }
      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async schema() {
    return null;
  }
}
