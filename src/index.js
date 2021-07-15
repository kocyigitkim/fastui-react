import React, { Component } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'rsuite/lib/styles/index.less';
import './styles.module.css'
import PropTypes from 'prop-types'
import Loading from './components/Loading'
import { FastForm, Field } from './components/Form'
import FastGrid from './components/FastGrid'
import { TextField } from "./components/TextField"
import { ButtonField } from './components/ButtonField'
import FastApi from 'fastapi-express-client'
import { ImagePickerField } from './components/ImagePicker';


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
  Field.register("text", TextField);
  Field.register("number", TextField);
  Field.register("email", TextField);
  Field.register("phone", TextField);
  Field.register("date", TextField);
  Field.register("time", TextField);
  Field.register("datetime", TextField);
  Field.register("password", TextField);
  Field.register("button", ButtonField);

  Field.register("image-picker", ImagePickerField);
}


export {
  InitializeFastUI,
  FastForm,
  FastGrid,
  Field,
  TextField
};