import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap';
import 'fastui/dist/index.css'
import { InitializeFastUI, FastForm, Field, FastGrid, LocalDataSource, FastUIProvider } from 'fastui'

const trMessages = require('./languages/tr.json');

export default class App extends Component {
  constructor(props) {
    super(props);
    InitializeFastUI({
      translate: ((k) => trMessages[k] || k)
    });
  }
  render() {
    return <div style={{ padding: 50 }}>
      <FastUIProvider></FastUIProvider>
      <FastGrid create edit delete search filter sort title="Ödeme Listesi">
        <Field type="text" name="firstname" title="Ad" />
        <Field type="text" name="lastname" title="Soyad" />
        <Field type="text" name="username" title="Kullanıcı Adı" />
        <Field type="money" name="money1" title="Para" currency="TRY" />
        <Field type="money" name="money1" title="Para" currency="USD" />
        <Field type="money" name="money1" title="Para" currency="EUR" />

      </FastGrid>
    </div>
      ;
  }
}