import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'fastui/dist/index.css'
import { InitializeFastUI, FastForm, Field } from 'fastui'

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
      <FastForm title="Yeni Kullanıcı" actions={[FastForm.Save]}>
        <Field type="text" name="username" title="Kullanıcı Adı" />
        <Field type="password" name="password" title="Şifre" />
      </FastForm>
    </div>
    ;
  }
}