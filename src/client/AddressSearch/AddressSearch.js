import { connectField, filterDOMProps } from 'uniforms';
import React, { useCallback, useEffect, useState } from 'react';
import { getAddressSuggestions } from './api/api';
import classNames from 'classnames';
import Autosuggest from 'react-autosuggest';
import styles from './AddressSearch.module.scss';

const debounce = (f, ms) => {
  let timeout;
  return async (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      f(...args);
    }, ms);
  };
};

export const AddressSearch = ({ id, className, error, required, name, label, value: address = {}, onChange, onAfterChange, delay = 800, disabled, validateStatus, help, ...props }) => {
  if (address === null) {
    address = {}
  }

  const [searchValue, setSearchValue] = useState(address.value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [fetchedFor, setFetchedFor] = useState([]);
  const [loading, setLoading] = useState(false);
  const displayType = props.displayType || 'input';

  const fetchSuggestions = useCallback(
    async (address) => {
      const res = await getAddressSuggestions(address, { count: 4 });
      const suggestions = res.suggestions;
            
      setSuggestions(suggestions);
      setLoading(false);
      setFetchedFor(address)
    },
    [delay]
  );

  const fetchSuggestionsDebounced = useCallback(
    debounce(async (address) => {
      fetchSuggestions(address);
    }, delay),
    [delay]
  );

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
    processOnChange(suggestion)
  };

  const processOnChange = (address) => {
    onChange && onChange(address);
    onAfterChange && onAfterChange(address);
  };

  const changeAddress = useCallback((e) => {
    const value = getValueFromEvent(e)
    if (value !== null) {
      setSearchValue(value.toString());
      processOnChange({ value })

      if (e.type === 'change' && value !== fetchedFor) {
        processSuggestionsDebounced(value);
      }
    }
  }, [])

  const selectAddress = () => {
    if (!address.unrestricted_value) {
      if (searchValue !== fetchedFor) {
        fetchSuggestions(searchValue)
      }

      if (suggestions.length) {
        address = suggestions[0]
        processOnChange(address)
      }
    }
  };

  const getValueFromEvent = (e) => {
    switch (e.type) {
      case 'click': return e.target.innerText
      case 'change': return e.target.value
      default: return null
    }
  };

  const renderInputComponent = (inputProps) => {
    return (
      <div>
        <input {...inputProps}  />
      </div>
    )
  }

  const suggestProps = {
    placeholder: "Введите адрес",
    value: searchValue,
    onBlur: selectAddress,
    onChange: changeAddress,
    disabled,
    id: name
  }

  return (
    <div className={classNames(styles.addressSearch, required && styles.requireStar)}>
      <div
        className={classNames(className, { disabled, error, required }, 'addressSearch')}      
        {...filterDOMProps(props)}>
        {label && <label htmlFor={name} className="address-label">{label}</label>}
        {displayType === 'input' && (
          <div className={styles.warningWpapper}>
            <div className={validateStatus && styles.border}>
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
            </div>
            {!!(error) && (
              <div className="ui red basic pointing label">{error.message}</div>
            )}
            {help && (
              <>
                <p className={styles.helpText}>{help}</p>
                <span className={styles.warningIcon}>
                  <svg
                    viewBox="64 64 896 896"
                    focusable="false"
                    data-icon="exclamation-circle"
                    width="1em"
                    height="1em"
                    fill="#faad14"
                    aria-hidden="true">
                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
                  </svg>
                </span>
              </>
            )}
          </div>
        )}
        {displayType === 'text' && (
          <div>{address.value || ''}</div>
        )}        
      </div>
    </div>
  );
};


const AddressSearchField = connectField(AddressSearch);
export default AddressSearchField;
