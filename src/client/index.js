const apiPath = process.env.API_PATH || '/api';

const processDadataApi = async (endPoint, params = {}, getResultFromBody) => {
  const queryParams = new URLSearchParams(params).toString();
  const res = await fetch(`${apiPath}/dadata/${endPoint}?${queryParams}`, {
    method: 'GET'
  });

  if (res.status === 204) {
    return { ok: true, coords: null };
  }

  const body = await res.json();
  if (!res.ok) {
    return { ok: false, error: body.error.type };
  } else {
    return { ok: true, ...getResultFromBody(body) };
  }
};

/**
 * Returns suggestions for given address
 * https://dadata.ru/api/suggest/address
 * @param address {string}
 * @param params {Object} optional parameters from https://dadata.ru/api/suggest/address/#parameters
 * @return {Promise<
 * {ok: boolean, suggestions: {value: string, unstrictedValue: string}[]}|{ok: boolean, error}>
 * }
 */
export const getAddressSuggestions = (address, params = {}) => {
  return processDadataApi('getAddressSuggestions', { ...params, address }, (body) => ({
    suggestions: body
  }));
};

/**
 * Converts address to object with latitude and longitude properties
 * https://dadata.ru/api/geocode
 * @param address {string}
 * @return {Promise<{ok: boolean, location: {lat: string, lon: string}|{ok: boolean, error}>}
 */
export const getAddressInfo = (address) => {
  return processDadataApi('findAddress', { address }, (body) => ({
    info: body
  }));
};

/**
 * Converts latitude and longitude to address
 * https://dadata.ru/api/geolocate
 * @param coords {{ lat: number, lon: number }}
 * @param params {Object} optional parameters from https://dadata.ru/api/geolocate/#params
 * @return {Promise<
 * {ok: boolean, address: {value: string, unstrictedValue: string}}|{ok: boolean, error}>
 * }
 */
export const getAddressFromCoords = (coords, params = {}) => {
  return processDadataApi('getAddressByCoordinates', { ...params, ...coords }, (body) => ({
    address: body
  }));
};
