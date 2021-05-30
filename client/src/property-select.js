import { Component } from 'react';
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { RestManager } from "./rest-manager";

var restManager = RestManager.getInstance();


class PropertySelect extends Component {
    render() {
      return (
        <Select
          className="control select"
          defaultValue={this.props.currentValue()}
          options={this.props.options}
          onChange = {this.props.setValue}
          value={this.props.currentValue()}
        />
      );
    }
  }
/*  
  const loadOptions = (inputValue, callback) => {
    console.log('Loading options...');
    ConfigurationsRequestResponse((data) => {
      console.log(`Received configurations ${JSON.stringify(data)}`);
      callback([
        { value: 'a1', label: 'a1' },
        { value: 'l1', label: 'l1' },
        { value: 'bmtk1', label: 'bmtk2' }
      ]);
    });
  }
*/

const loadOptions = inputValue => 
  new Promise(resolve => {
    restManager.ConfigurationsRequestResponse((data) => {
      console.log(`Received configurations ${JSON.stringify(data)}`);
      if (typeof data.result === 'undefined' || data.result !== 'ok') {
        if (typeof data.error !== 'undefined' && data.error != null && typeof data.errordetail !== 'undefined') {
          var status = document.getElementById('status');
          status.value = `Error: ${data.error} - ${data.errordetail}`
          }
          resolve([]);
        }
        else {
          var options = [];
          data.options.configurations.forEach(option => {
            options.push({value: option, label: option});
          })
         resolve(options);
        }
      });
    });
  
  class AsyncConfigurationsSelect extends Component {
    render() {
      return (
        <AsyncSelect
          className="control select"
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions={[]}
          onChange={this.props.setValue}
        />
      );
    }
  }
  
export { PropertySelect, AsyncConfigurationsSelect };
