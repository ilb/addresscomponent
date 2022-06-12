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
        return suggestions.map(({ value, unrestricted_value, data }) => ({
          value,
          unrestricted_value,

          country: data.country,
          country_iso_code: data.country_iso_code,

          area: data.area,
          area_with_type: data.area_with_type,
          area_type_full: data.area_type_full,

          postal_code: data.postal_code,

          region: data.region,
          region_iso_code: data.region_iso_code,
          region_with_type: data.region_with_type,

          city: data.city,
          city_type_full: data.city_type_full,
          city_with_type: data.city_with_type,

          settlement: data.settlement,
          settlement_type_full: data.settlement_type_full,
          settlement_with_type: data.settlement_with_type,

          street: data.street,
          street_type_full: data.street_type_full,
          street_with_type: data.street_with_type,

          house: data.house,

          building: data.block,
          building_type_full: data.block_type_full,
          building_with_type: data.block !== null ? data.block_type + ' ' + data.block : null,

          flat: data.flat,
          flat_type_full: data.flat_type_full,
          flat_with_type: data.flat_with_type,

          region_fias_id: data.region_fias_id,
          area_fias_id: data.area_fias_id,
          city_fias_id: data.city_fias_id,
          settlement_fias_id: data.settlement_fias_id,
          street_fias_id: data.street_fias_id,
          house_fias_id: data.house_fias_id,
          flat_fias_id: data.flat_fias_id,
          fias_id: data.fias_id,
          fias_code: data.fias_code,
          fias_level: data.fias_level,
          kladr_id: data.kladr_id,
          region_kladr_id: data.region_kladr_id
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
