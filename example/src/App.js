import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'fastui/dist/index.css'
import { InitializeFastUI, FastForm, Field, FastGrid, LocalDataSource } from 'fastui'

const trMessages = require('./languages/tr.json');

export default class App extends Component {
  constructor(props) {
    super(props);
    InitializeFastUI({
      translate: ((k) => trMessages[k] || k)
    });
  }
  render() {
    return <div style={{ margin: 50 }}>
      <FastGrid search filter checked sort create edit delete title="Hello World :)" datasource={new LocalDataSource([
        {id: 1,firstname: "Muhammet", lastname: "Koçyiğit", username: "mkocyigit", "isactive": true},
        {id: 2,firstname: "Seda Sıla", lastname: "Arslan", username: "sarslan", "isactive": true},
        {id: 3,firstname: "Selman", lastname: "Şişman", username: "ssisman", "isactive": true}
      ])}>
        <Field type="text" name="firstname" title="Ad" />
        <Field type="text" name="lastname" title="Soyad" />
        <Field type="text" name="username" title="Kullanıcı Adı" />
        <Field type="text" name="isactive" title="Aktif Mi?" />
      </FastGrid>
    </div>
    ;
  }
}