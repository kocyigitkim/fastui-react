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
import ComboBoxField from './components/ComboBoxField';
import { IDataSource, LocalDataSource, RemoteDataSource } from './DataSource';
import TabControlField from './components/TabControlField';
import RichTextField from './components/RichTextField';
import TitleField from './components/TitleField';
import { PermissionBuilder } from './PermissionBuilder';


function InitializeFastUI({ translate, apiHandler, redisEnabled, corsEnabled, permissionBuilder }) {

  if (!apiHandler) {
    apiHandler = new FastApi.FastApiClient();
  }
  if (apiHandler && apiHandler.setRedis && redisEnabled) {
    apiHandler.setSession(FastApi.FastApiSessionController.ExpressSession);
  }
  if (apiHandler && apiHandler.setCors && corsEnabled) {
    apiHandler.setCors();
  }

  if(!permissionBuilder){
    permissionBuilder = new PermissionBuilder();
  }

  global.window.fastui = {
    translate,
    apiHandler,
    redisEnabled,
    corsEnabled,
    permissionBuilder
  };
  //Register fields
  Field.register("title", TitleField);
  Field.register("text", TextField);
  Field.register("number", TextField);
  Field.register("email", TextField);
  Field.register("phone", TextField);
  Field.register("date", TextField);
  Field.register("time", TextField);
  Field.register("password", TextField);
  Field.register("button", ButtonField);
  Field.register("combobox", ComboBoxField);
  Field.register("image-picker", ImagePickerField);
  Field.register("richtext" , RichTextField);
  
  Field.register("tabcontrol", TabControlField);
}


export {
  InitializeFastUI,
  FastForm,
  FastGrid,
  Field,
  TextField,
  IDataSource,
  LocalDataSource,
  RemoteDataSource
};