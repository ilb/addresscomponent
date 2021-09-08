import { connectField, filterDOMProps } from 'uniforms';
import { useCallback, useEffect, useState } from 'react';
import { Loader } from 'semantic-ui-react';
import { getAddressSuggestions } from '../../client';
import classNames from 'classnames';
import Autosuggest from 'react-autosuggest';

const debounce = (f, ms) => {
  let timeout;
  return async (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      f(...args);
    }, ms);
  };
};

const prepareValue = (address) => {
  if (address === undefined) {
    return {}
  }

  if (typeof address === 'object') {
    return address
  }

  if (typeof address === 'string') {
    return JSON.parse(address)
  }
}

export const AddressSearch = ({ id, className, error, required, label, value: address, onChange, delay = 800, disabled, ...props }) => {
  let fetchedFor = ''
  address = prepareValue(address)
  const [searchValue, setSearchValue] = useState(address.value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const displayType = props.displayType || 'input';

  const fetchSuggestions = useCallback(
    async (address) => {
      const res = await getAddressSuggestions(address, { count: 4 });
      const suggestions = res.suggestions;

      setSuggestions(suggestions);
      setLoading(false);
      fetchedFor = address
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
    setSearchValue(address.value || '');
  }, [address]);

  const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getSuggestions = value => {
    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
      return [];
    }

    const regex = new RegExp('^' + escapedValue, 'i');
    const options = suggestions.filter(suggestion => regex.test(suggestion.value));

    return options;
  }

  const getSuggestionValue = suggestion => {
    return suggestion.value;
  };

  const renderSuggestion = suggestion => {
    return <span>{suggestion.value}</span>;
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value))
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([])
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    onChange(JSON.stringify(suggestion));
  };

  const renderInputComponent = (inputProps) => {
    return (
      <div>
        <input {...inputProps} />
        {
          loading ? <Loader style={{position: 'absolute', right: 10, top: 7, left: 'auto'}} active inline size='tiny' /> : ''
        }
      </div>
    )
  }

  const suggestProps = {
    placeholder: "Введите адрес",
    value: searchValue,
    onChange: useCallback((e) => {
      const address = e.type === 'click' ? e.target.innerText : e.target.value;
      console.log(address, fetchedFor)
      onChange(JSON.stringify({ value: address }))
      if (typeof address === Object ) {
        setSearchValue(address.value || '');
      } else {
        setSearchValue(address.toString());
      }
      address !== fetchedFor && processSuggestionsDebounced(address);
    }, [])
  }

  return (
    <div
      className={classNames(className, { disabled, error, required }, 'field')}
      {...filterDOMProps(props)}>
      {label && <label htmlFor={id}>{label}</label>}
      {displayType === 'input' && (
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          onSuggestionSelected={onSuggestionSelected}
          renderInputComponent={renderInputComponent}
          value={searchValue || ''}
          inputProps={suggestProps}
        />
      )}
      {displayType === 'text' && (
        <div>{address.value || ''}</div>
      )}
    </div>
  );
};


const AddressSearchField = connectField(AddressSearch);
export default AddressSearchField;
