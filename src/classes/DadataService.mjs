import fetch from 'isomorphic-fetch';

export default class DadataService {
  constructor({ dadataConfig }) {
    this.dadata = dadataConfig;
  }

  async getAddressSuggestions(address, params = {}) {
    const res = await fetch(
      `https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Token ' + this.dadata.token
        },
        body: JSON.stringify({ ...params, query: address })
      }
    );

    if (res.ok) {
      const body = await res.json();
      return body.suggestions;
    }
    return null;
  }

  async getAddressesFromCoords(coords, params = {}) {
    const queryParams = new URLSearchParams({ ...params, ...coords }).toString();
    const res = await fetch(
      `https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Token ' + this.dadata.token
        }
      }
    );

    if (res.ok) {
      const body = await res.json();
      return body.suggestions;
    }
    return null;
  }

  async getAddressInfo(address) {
    const res = await fetch('https://cleaner.dadata.ru/api/v1/clean/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Token ' + this.dadata.token,
        'X-Secret': this.dadata.secretKey
      },
      body: JSON.stringify([address])
    });
    if (res.ok) {
      const body = await res.json();
      return body[0];
    }
    return null;
  }
}
