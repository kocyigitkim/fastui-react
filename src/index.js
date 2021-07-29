import React, { Component } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'rsuite/lib/styles/index.less';
import './styles.module.css'
import PropTypes from 'prop-types'
import Loading from './components/Loading'
import { FastForm } from './components/Form'
import { Field } from "./components/Field";
import FastGrid from './components/FastGrid'
import { TextField } from "./components/TextField"
import { ButtonField } from './components/ButtonField'
import FastApi from 'fastapi-express-client'
import { ImagePickerField } from './components/ImagePicker';
import ComboBoxField from './components/ComboBoxField';
import { IDataSource, LocalDataSource, RemoteDataSource } from './DataSource';
import TabControlField from './components/TabControlField';
import RichTextField from './components/RichTextField';
import TitleField from './components/TitleField';
import ImageField from './components/ImageField';
import * as PanelField from './components/PanelField';


function InitializeFastUI({ translate, apiHandler, redisEnabled, corsEnabled }) {

  if (!apiHandler) {
    apiHandler = new FastApi.FastApiClient();
  }
  if (apiHandler && apiHandler.setRedis && redisEnabled) {
    apiHandler.setSession(FastApi.FastApiSessionController.ExpressSession);
  }
  if (apiHandler && apiHandler.setCors && corsEnabled) {
    apiHandler.setCors();
  }

  global.window.fastui = {
    translate,
    apiHandler,
    redisEnabled,
    corsEnabled
  };
  //Register fields
  Field.register("title", TitleField);
  Field.register("text", TextField);
  Field.register("number", TextField);
  Field.register("email", TextField);
  Field.register("phone", TextField);
  Field.register("money", TextField);
  Field.register("date", TextField);
  Field.register("time", TextField);
  Field.register("username", TextField);
  Field.register("firstname", TextField);
  Field.register("lastname", TextField);
  Field.register("name", TextField);
  Field.register("surname", TextField);
  Field.register("password", TextField);
  Field.register("button", ButtonField);
  Field.register("combobox", ComboBoxField);
  Field.register("image", ImageField);
  Field.register("image-picker", ImagePickerField);
  Field.register("richtext", RichTextField);
  Field.register("panel", PanelField.PanelField);

  Field.register("tabcontrol", TabControlField);
  registerCSS();
}

function registerCSS() {
  var css = `
 table tr {
  animation: table-row-load-ani 250ms 1 ease;
}

@keyframes table-row-load-ani{
  0%{opacity:0; transform: translateY(10px)}
}

.btn, button, input, select, .select2, .form-label, h1,h2,h3,h4,h5,h6, .alert {
  animation: bootstrap-load-ani 300ms 1 ease;
}

@keyframes bootstrap-load-ani{
  0%{opacity:0; transform: translateY(5px)}
}
 `;

  var __rawStyleChild = global.window.document.createElement("style");
  __rawStyleChild.innerText = css;
  global.window.document.head.appendChild(__rawStyleChild);
}


export {
  InitializeFastUI,
  FastForm,
  FastGrid,
  Field,
  TextField,
  PanelField,
  IDataSource,
  LocalDataSource,
  RemoteDataSource
};