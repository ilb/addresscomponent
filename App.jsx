import React from 'react';
import 'semantic-ui-offline/semantic.min.css';
import AddressSearchField from "./src/components/AddressSearch";

export default function App() {
  return (
    <div className="ui container">
      <h1>Hello World!</h1>
        <AddressSearchField name='regAddress'/>
    </div>
  );
}
