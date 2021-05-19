/**
 * Returns suggestions for given address
 */
export default class GetAddressSuggestions {
  constructor({ dadataService }) {
    this.dadataService = dadataService;
  }

  async process({ address, ...restParams }) {
    try {
      const suggestions = await this.dadataService.getAddressSuggestions(address, restParams);
      if (suggestions) {
        return suggestions.map(({ value, restricted_value }) => ({
          value,
          restrictedValue: restricted_value
        }));
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
