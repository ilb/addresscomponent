import { connectField } from 'uniforms';
import { useCallback, useEffect, useState } from 'react';
import { Search } from 'semantic-ui-react';
import { getAddressSuggestions } from '../../client';

const debounce = (f, ms) => {
  let timeout;
  return async (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      f(...args);
    }, ms);
  };
};

export const AddressSearch = ({ address, onAddressChange, delay = 800, disabled }) => {
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
      style={{ opacity: 1 }}
      input={{ fluid: true, placeholder: 'Введите адрес', disabled }}
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


const AddressSearchField = connectField(AddressSearch);
export default AddressSearchField;
