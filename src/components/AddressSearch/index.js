import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RControl, RFeature, RLayerVector, RMap, ROSM, RStyle } from 'rlayers';
import { Form, Search } from 'semantic-ui-react';
import { getAddressFromCoords, getAddressSuggestions, getAddressInfo } from '../../classes/DadataAdapter';
import { connectField } from 'uniforms';
import { colors } from './colors';

// !!!
// HOW TO IMPORT:
// import dynamic from 'next/dynamic';
// const MapSearchField = dynamic(
//   import('{path_to_file}/components/fields/MapSearchField'), { ssr: false }
// );
// !!!

const debounce = (f, ms) => {
  let timeout;
  return async (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      f(...args);
    }, ms);
  };
};

const AddressSuggestionInput = ({ address, onAddressChange, delay = 800, disabled }) => {
  const [searchValue, setSearchValue] = useState(address);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestionsFetchedFor, setSuggestionsFetchedFor] = useState(null);

  const fetchSuggestions = useCallback(
    async (address) => {
      const res = await getAddressSuggestions(address, { count: 4 });
      const suggestions = res.suggestions;

      setSuggestions(suggestions);
      setSuggestionsFetchedFor(address);
      setLoading(false);
    },
    [delay]
  );
  const fetchSuggestionsDebounced = useCallback(
    debounce(async (address) => {
      fetchSuggestions(address);
    }, delay),
    [delay]
  );

  const processSuggestions = useCallback(async (address) => {
    if (address) {
      setLoading(true);
      fetchSuggestions(address);
    }
  }, []);

  const processSuggestionsDebounced = useCallback(async (address) => {
    if (address) {
      setLoading(true);
      fetchSuggestionsDebounced(address);
    }
  }, []);

  useEffect(() => {
    !searchValue && setSuggestions([]);
  }, [searchValue]);

  useEffect(() => {
    setSearchValue(address);
  }, [address]);

  return (
    <Search
      fluid
      size="small"
      style={{ opacity: 0.85 }}
      input={{ fluid: true, placeholder: 'Введите адрес или выберите точку на карте', disabled }}
      loading={loading}
      value={searchValue || ''}
      onSearchChange={useCallback((e, data) => {
        const address = data.value;
        setSearchValue(address);
        processSuggestionsDebounced(address);
      }, [])}
      onResultSelect={useCallback((e, data) => {
        const address = data.result.title;
        setSearchValue(address);
        onAddressChange && onAddressChange(address);
      }, [])}
      onFocus={() => {
        suggestionsFetchedFor !== address && processSuggestions(address);
      }}
      noResultsMessage={'Ничего не найдено'}
      showNoResults={!loading || !suggestions}
      results={
        suggestions
          ? suggestions.map(({ value }) => ({
              title: value
            }))
          : []
      }
    />
  );
};

const MapSearch = ({ onChange, stringAddress, error, disabled }) => {
  const locationMarkRef = useRef(null);
  // location is { lat: number, lon: number }
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);

  const onCoordsChange = async (newCoords) => {
    setLocation(newCoords);

    const res = await getAddressFromCoords(newCoords);
    const address = res.address;
    setAddress({ ...address.data, value: address.value });
  };
  const onAddressChange = async (strAddress) => {
    const res = await getAddressInfo(strAddress);
    const info = res?.info;

    if (res.ok && info) {
      const { result, ...addressRest } = info;
      setAddress({ ...addressRest, value: result });

      const { geo_lon: lon, geo_lat: lat } = info;
      setLocation({ lon, lat });

      // move viewport to location mark
      locationMarkRef.current &&
        locationMarkRef.current.context.map
          .getView()
          .fit(locationMarkRef.current.ol.getGeometry().getExtent(), {
            duration: 250,
            maxZoom: 16
          });
    }
  };

  useEffect(() => {
    onChange(address);
  }, [address]);

  useEffect(() => {
    if (stringAddress && typeof stringAddress === 'string') {
      onAddressChange(stringAddress);
    }
  }, [stringAddress]);

  return (
    <>
      <Form.Field
        error={!!error}
        disabled={disabled}
        style={{
          height: 300,
          borderRadius: 4,
          overflow: 'hidden',
          border: `1px solid ${error ? colors.inputBorderError : colors.inputBorder}`
        }}>
        <RMap
          onDblClick={(e) => {
            e.preventDefault();
          }}
          noDefaultControls
          width="100%"
          height="100%"
          onClick={(e) => {
            const coords = e.map.getCoordinateFromPixel(e.pixel);
            const [lon, lat] = toLonLat(coords);
            onCoordsChange({ lon, lat });
          }}
          center={fromLonLat([37.618423, 55.751244])}
          zoom={7}>
          <ROSM />
          {location && (
            <RLayerVector>
              <RFeature
                ref={locationMarkRef}
                geometry={new Point(fromLonLat([location.lon, location.lat]))}
              />
            </RLayerVector>
          )}

          <RControl.RCustom>
            <div style={{ margin: '0.5rem 0.5rem', width: 'auto' }}>
              <AddressSuggestionInput
                address={address?.value}
                onAddressChange={onAddressChange}
                disabled={disabled}
              />
            </div>
          </RControl.RCustom>
        </RMap>
      </Form.Field>
    </>
  );
};

const MapSearchField = connectField(MapSearch);

export default MapSearchField;
