import React, { Component } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap4-toggle/css/bootstrap4-toggle.min.css'
import JQUERY from 'jquery/dist/jquery.slim'

import 'bootstrap/dist/js/bootstrap.bundle'
import './styles.module.css'
import Loading from './components/Loading'
import { FastForm } from './components/Form'
import { Field } from "./components/Field";
import FastGrid from './components/FastGrid'
import { TextField } from "./components/TextField"
import { CustomField } from "./components/CustomField"
import { ButtonField } from './components/ButtonField'
import * as FastApi from 'fastapi-express-client'
import { ImagePickerField } from './components/ImagePicker';
import ComboBoxField from './components/ComboBoxField';
import { IDataSource, LocalDataSource, RemoteDataSource } from './DataSource';
import TabControlField from './components/TabControlField';
import RichTextField from './components/RichTextField';
import TitleField from './components/TitleField';
import { PermissionBuilder } from './PermissionBuilder';
import FastUIProvider from './components/FastUIProvider';

import ImageField from './components/ImageField';
import * as PanelField from './components/PanelField';
import MoneyField from './components/MoneyField';
import { translate, getApiHandler, getPermissionBuilder } from './utils'
import { initPredefinedValidators, setValidator, validate, validateMultiple } from './validation';
import { CheckBoxField } from './components/CheckBox'
import MapPickerField from './components/MapPickerField'
import { FastDialog } from './components/Dialog'
import { RemoteFileProvider } from './FileProvider'
import LabelField from './components/LabelField'
import AccessDenied from './components/AccessDenied'
import State from 'faststate-react/states/State'
import { ReactBridge } from './ReactBridge'

function InitializeFastUI({ translate, apiHandler, redisEnabled, corsEnabled, permissionBuilder, fileProvider, useHistory, react }) {
    global.window.jQuery = JQUERY;
    global.jQuery = JQUERY;
    global.window.$ = JQUERY;
    global.$ = JQUERY;
    require('select2/dist/js/select2.js');


    require('bootstrap-select/dist/js/bootstrap-select');
    require('bootstrap4-toggle/js/bootstrap4-toggle.min.js');



    if (!apiHandler) {
        apiHandler = new FastApi.FastApiClient();
    }
    if (apiHandler && redisEnabled) {
        apiHandler.setSession(FastApi.FastApiSessionController.FastApiSession);
    }
    else {
        apiHandler.setSession(FastApi.FastApiSessionController.ExpressSession);
    }
    if (apiHandler && apiHandler.setCors && corsEnabled) {
        apiHandler.setCors();
    }

    if (!fileProvider) {
        fileProvider = new RemoteFileProvider();
    }

    if (!permissionBuilder) {
        permissionBuilder = new PermissionBuilder({});
    }

    global.window.fastui = {
        routerState: new State(),
        useHistory,
        react,
        translate,
        apiHandler,
        redisEnabled,
        corsEnabled,
        permissionBuilder,
        fileProvider,
        validators: [],
        validate: validate,
        validateMultiple: validateMultiple
    };

    initPredefinedValidators();

    //Register fields
    Field.register("title", TitleField);
    Field.register("label", LabelField);
    Field.register("text", TextField);
    Field.register("number", TextField);
    Field.register("email", TextField);
    Field.register("phone", TextField);
    Field.register("money", MoneyField);
    Field.register("date", TextField);
    Field.register("time", TextField);
    Field.register("username", TextField);
    Field.register("firstname", TextField);
    Field.register("lastname", TextField);
    Field.register("checkbox", CheckBoxField);
    Field.register("name", TextField);
    Field.register("surname", TextField);
    Field.register("password", TextField);
    Field.register("button", ButtonField);
    Field.register("combobox", ComboBoxField);
    Field.register("image", ImageField);
    Field.register("image-picker", ImagePickerField);
    Field.register("richtext", RichTextField);
    Field.register("panel", PanelField.PanelField);
    Field.register("map-picker", MapPickerField);
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
  /*animation: bootstrap-load-ani 300ms 1 ease;*/
}

@keyframes bootstrap-load-ani{
  0%{opacity:0; transform: translateY(5px)}
}

.fastui-validation-error input{
  border-color: rgba(255,0,0,0.7);
  background-color: rgba(255,0,0,0.1);
}

.fastui-validation-success input{
  border-color: rgba(0, 173, 0,0.7) !important;
  background-color: rgba(0,173,0,0.1) !important;
}

.fastui-validation-error-message{
  font-size:0.8rem;
  color: maroon;
  background-color:rgba(255,0,0,0.1);
  margin-bottom: 10px;
  border-left: 1px solid rgba(150,0,0,0.7);
  padding: 10px;
  animation: fastui-validation-error-message-ani 500ms 1 ease;
}

.fastui-validation-required {
  font-size: 0.8rem;
  font-weight: bold;
  opacity: 0.75;
  margin-bottom: 5px;
  padding: 5px;
  display: inline-block;
  color: maroon;
  animation: fastui-validation-error-message-ani 500ms 1 ease;
}

@keyframes fastui-validation-error-message-ani{
  0%{
      opacity:0;
      transform: translateY(-5px);
  }
}

.select2-container{box-sizing:border-box;display:inline-block;margin:0;position:relative;vertical-align:middle}.select2-container .select2-selection--single{box-sizing:border-box;cursor:pointer;display:block;height:28px;user-select:none;-webkit-user-select:none}.select2-container .select2-selection--single .select2-selection__rendered{display:block;padding-left:8px;padding-right:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.select2-container .select2-selection--single .select2-selection__clear{position:relative}.select2-container[dir="rtl"] .select2-selection--single .select2-selection__rendered{padding-right:8px;padding-left:20px}.select2-container .select2-selection--multiple{box-sizing:border-box;cursor:pointer;display:block;min-height:32px;user-select:none;-webkit-user-select:none}.select2-container .select2-selection--multiple .select2-selection__rendered{display:inline-block;overflow:hidden;padding-left:8px;text-overflow:ellipsis;white-space:nowrap}.select2-container .select2-search--inline{float:left}.select2-container .select2-search--inline .select2-search__field{box-sizing:border-box;border:none;font-size:100%;margin-top:5px;padding:0}.select2-container .select2-search--inline .select2-search__field::-webkit-search-cancel-button{-webkit-appearance:none}.select2-dropdown{background-color:white;border:1px solid #aaa;border-radius:4px;box-sizing:border-box;display:block;position:absolute;left:-100000px;width:100%;z-index:1051}.select2-results{display:block}.select2-results__options{list-style:none;margin:0;padding:0}.select2-results__option{padding:6px;user-select:none;-webkit-user-select:none}.select2-results__option[aria-selected]{cursor:pointer}.select2-container--open .select2-dropdown{left:0}.select2-container--open .select2-dropdown--above{border-bottom:none;border-bottom-left-radius:0;border-bottom-right-radius:0}.select2-container--open .select2-dropdown--below{border-top:none;border-top-left-radius:0;border-top-right-radius:0}.select2-search--dropdown{display:block;padding:4px}.select2-search--dropdown .select2-search__field{padding:4px;width:100%;box-sizing:border-box}.select2-search--dropdown .select2-search__field::-webkit-search-cancel-button{-webkit-appearance:none}.select2-search--dropdown.select2-search--hide{display:none}.select2-close-mask{border:0;margin:0;padding:0;display:block;position:fixed;left:0;top:0;min-height:100%;min-width:100%;height:auto;width:auto;opacity:0;z-index:99;background-color:#fff;filter:alpha(opacity=0)}.select2-hidden-accessible{border:0 !important;clip:rect(0 0 0 0) !important;-webkit-clip-path:inset(50%) !important;clip-path:inset(50%) !important;height:1px !important;overflow:hidden !important;padding:0 !important;position:absolute !important;width:1px !important;white-space:nowrap !important}.select2-container--default .select2-selection--single{background-color:#fff;border:1px solid #aaa;border-radius:4px}.select2-container--default .select2-selection--single .select2-selection__rendered{color:#444;line-height:28px}.select2-container--default .select2-selection--single .select2-selection__clear{cursor:pointer;float:right;font-weight:bold}.select2-container--default .select2-selection--single .select2-selection__placeholder{color:#999}.select2-container--default .select2-selection--single .select2-selection__arrow{height:26px;position:absolute;top:1px;right:1px;width:20px}.select2-container--default .select2-selection--single .select2-selection__arrow b{border-color:#888 transparent transparent transparent;border-style:solid;border-width:5px 4px 0 4px;height:0;left:50%;margin-left:-4px;margin-top:-2px;position:absolute;top:50%;width:0}.select2-container--default[dir="rtl"] .select2-selection--single .select2-selection__clear{float:left}.select2-container--default[dir="rtl"] .select2-selection--single .select2-selection__arrow{left:1px;right:auto}.select2-container--default.select2-container--disabled .select2-selection--single{background-color:#eee;cursor:default}.select2-container--default.select2-container--disabled .select2-selection--single .select2-selection__clear{display:none}.select2-container--default.select2-container--open .select2-selection--single .select2-selection__arrow b{border-color:transparent transparent #888 transparent;border-width:0 4px 5px 4px}.select2-container--default .select2-selection--multiple{background-color:white;border:1px solid #aaa;border-radius:4px;cursor:text}.select2-container--default .select2-selection--multiple .select2-selection__rendered{box-sizing:border-box;list-style:none;margin:0;padding:0 5px;width:100%}.select2-container--default .select2-selection--multiple .select2-selection__rendered li{list-style:none}.select2-container--default .select2-selection--multiple .select2-selection__clear{cursor:pointer;float:right;font-weight:bold;margin-top:5px;margin-right:10px;padding:1px}.select2-container--default .select2-selection--multiple .select2-selection__choice{background-color:#e4e4e4;border:1px solid #aaa;border-radius:4px;cursor:default;float:left;margin-right:5px;margin-top:5px;padding:0 5px}.select2-container--default .select2-selection--multiple .select2-selection__choice__remove{color:#999;cursor:pointer;display:inline-block;font-weight:bold;margin-right:2px}.select2-container--default .select2-selection--multiple .select2-selection__choice__remove:hover{color:#333}.select2-container--default[dir="rtl"] .select2-selection--multiple .select2-selection__choice,.select2-container--default[dir="rtl"] .select2-selection--multiple .select2-search--inline{float:right}.select2-container--default[dir="rtl"] .select2-selection--multiple .select2-selection__choice{margin-left:5px;margin-right:auto}.select2-container--default[dir="rtl"] .select2-selection--multiple .select2-selection__choice__remove{margin-left:2px;margin-right:auto}.select2-container--default.select2-container--focus .select2-selection--multiple{border:solid black 1px;outline:0}.select2-container--default.select2-container--disabled .select2-selection--multiple{background-color:#eee;cursor:default}.select2-container--default.select2-container--disabled .select2-selection__choice__remove{display:none}.select2-container--default.select2-container--open.select2-container--above .select2-selection--single,.select2-container--default.select2-container--open.select2-container--above .select2-selection--multiple{border-top-left-radius:0;border-top-right-radius:0}.select2-container--default.select2-container--open.select2-container--below .select2-selection--single,.select2-container--default.select2-container--open.select2-container--below .select2-selection--multiple{border-bottom-left-radius:0;border-bottom-right-radius:0}.select2-container--default .select2-search--dropdown .select2-search__field{border:1px solid #aaa}.select2-container--default .select2-search--inline .select2-search__field{background:transparent;border:none;outline:0;box-shadow:none;-webkit-appearance:textfield}.select2-container--default .select2-results>.select2-results__options{max-height:200px;overflow-y:auto}.select2-container--default .select2-results__option[role=group]{padding:0}.select2-container--default .select2-results__option[aria-disabled=true]{color:#999}.select2-container--default .select2-results__option[aria-selected=true]{background-color:#ddd}.select2-container--default .select2-results__option .select2-results__option{padding-left:1em}.select2-container--default .select2-results__option .select2-results__option .select2-results__group{padding-left:0}.select2-container--default .select2-results__option .select2-results__option .select2-results__option{margin-left:-1em;padding-left:2em}.select2-container--default .select2-results__option .select2-results__option .select2-results__option .select2-results__option{margin-left:-2em;padding-left:3em}.select2-container--default .select2-results__option .select2-results__option .select2-results__option .select2-results__option .select2-results__option{margin-left:-3em;padding-left:4em}.select2-container--default .select2-results__option .select2-results__option .select2-results__option .select2-results__option .select2-results__option .select2-results__option{margin-left:-4em;padding-left:5em}.select2-container--default .select2-results__option .select2-results__option .select2-results__option .select2-results__option .select2-results__option .select2-results__option .select2-results__option{margin-left:-5em;padding-left:6em}.select2-container--default .select2-results__option--highlighted[aria-selected]{background-color:#5897fb;color:white}.select2-container--default .select2-results__group{cursor:default;display:block;padding:6px}.select2-container--classic .select2-selection--single{background-color:#f7f7f7;border:1px solid #aaa;border-radius:4px;outline:0;background-image:-webkit-linear-gradient(top, #fff 50%, #eee 100%);background-image:-o-linear-gradient(top, #fff 50%, #eee 100%);background-image:linear-gradient(to bottom, #fff 50%, #eee 100%);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFFFFFFF', endColorstr='#FFEEEEEE', GradientType=0)}.select2-container--classic .select2-selection--single:focus{border:1px solid #5897fb}.select2-container--classic .select2-selection--single .select2-selection__rendered{color:#444;line-height:28px}.select2-container--classic .select2-selection--single .select2-selection__clear{cursor:pointer;float:right;font-weight:bold;margin-right:10px}.select2-container--classic .select2-selection--single .select2-selection__placeholder{color:#999}.select2-container--classic .select2-selection--single .select2-selection__arrow{background-color:#ddd;border:none;border-left:1px solid #aaa;border-top-right-radius:4px;border-bottom-right-radius:4px;height:26px;position:absolute;top:1px;right:1px;width:20px;background-image:-webkit-linear-gradient(top, #eee 50%, #ccc 100%);background-image:-o-linear-gradient(top, #eee 50%, #ccc 100%);background-image:linear-gradient(to bottom, #eee 50%, #ccc 100%);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFEEEEEE', endColorstr='#FFCCCCCC', GradientType=0)}.select2-container--classic .select2-selection--single .select2-selection__arrow b{border-color:#888 transparent transparent transparent;border-style:solid;border-width:5px 4px 0 4px;height:0;left:50%;margin-left:-4px;margin-top:-2px;position:absolute;top:50%;width:0}.select2-container--classic[dir="rtl"] .select2-selection--single .select2-selection__clear{float:left}.select2-container--classic[dir="rtl"] .select2-selection--single .select2-selection__arrow{border:none;border-right:1px solid #aaa;border-radius:0;border-top-left-radius:4px;border-bottom-left-radius:4px;left:1px;right:auto}.select2-container--classic.select2-container--open .select2-selection--single{border:1px solid #5897fb}.select2-container--classic.select2-container--open .select2-selection--single .select2-selection__arrow{background:transparent;border:none}.select2-container--classic.select2-container--open .select2-selection--single .select2-selection__arrow b{border-color:transparent transparent #888 transparent;border-width:0 4px 5px 4px}.select2-container--classic.select2-container--open.select2-container--above .select2-selection--single{border-top:none;border-top-left-radius:0;border-top-right-radius:0;background-image:-webkit-linear-gradient(top, #fff 0%, #eee 50%);background-image:-o-linear-gradient(top, #fff 0%, #eee 50%);background-image:linear-gradient(to bottom, #fff 0%, #eee 50%);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFFFFFFF', endColorstr='#FFEEEEEE', GradientType=0)}.select2-container--classic.select2-container--open.select2-container--below .select2-selection--single{border-bottom:none;border-bottom-left-radius:0;border-bottom-right-radius:0;background-image:-webkit-linear-gradient(top, #eee 50%, #fff 100%);background-image:-o-linear-gradient(top, #eee 50%, #fff 100%);background-image:linear-gradient(to bottom, #eee 50%, #fff 100%);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFEEEEEE', endColorstr='#FFFFFFFF', GradientType=0)}.select2-container--classic .select2-selection--multiple{background-color:white;border:1px solid #aaa;border-radius:4px;cursor:text;outline:0}.select2-container--classic .select2-selection--multiple:focus{border:1px solid #5897fb}.select2-container--classic .select2-selection--multiple .select2-selection__rendered{list-style:none;margin:0;padding:0 5px}.select2-container--classic .select2-selection--multiple .select2-selection__clear{display:none}.select2-container--classic .select2-selection--multiple .select2-selection__choice{background-color:#e4e4e4;border:1px solid #aaa;border-radius:4px;cursor:default;float:left;margin-right:5px;margin-top:5px;padding:0 5px}.select2-container--classic .select2-selection--multiple .select2-selection__choice__remove{color:#888;cursor:pointer;display:inline-block;font-weight:bold;margin-right:2px}.select2-container--classic .select2-selection--multiple .select2-selection__choice__remove:hover{color:#555}.select2-container--classic[dir="rtl"] .select2-selection--multiple .select2-selection__choice{float:right;margin-left:5px;margin-right:auto}.select2-container--classic[dir="rtl"] .select2-selection--multiple .select2-selection__choice__remove{margin-left:2px;margin-right:auto}.select2-container--classic.select2-container--open .select2-selection--multiple{border:1px solid #5897fb}.select2-container--classic.select2-container--open.select2-container--above .select2-selection--multiple{border-top:none;border-top-left-radius:0;border-top-right-radius:0}.select2-container--classic.select2-container--open.select2-container--below .select2-selection--multiple{border-bottom:none;border-bottom-left-radius:0;border-bottom-right-radius:0}.select2-container--classic .select2-search--dropdown .select2-search__field{border:1px solid #aaa;outline:0}.select2-container--classic .select2-search--inline .select2-search__field{outline:0;box-shadow:none}.select2-container--classic .select2-dropdown{background-color:#fff;border:1px solid transparent}.select2-container--classic .select2-dropdown--above{border-bottom:none}.select2-container--classic .select2-dropdown--below{border-top:none}.select2-container--classic .select2-results>.select2-results__options{max-height:200px;overflow-y:auto}.select2-container--classic .select2-results__option[role=group]{padding:0}.select2-container--classic .select2-results__option[aria-disabled=true]{color:grey}.select2-container--classic .select2-results__option--highlighted[aria-selected]{background-color:#3875d7;color:#fff}.select2-container--classic .select2-results__group{cursor:default;display:block;padding:6px}.select2-container--classic.select2-container--open .select2-dropdown{border-color:#5897fb}

/*! * Select2-to-Tree CSS 1.1.1 * https://github.com/clivezhg/select2-to-tree */
.s2-to-tree *{
    box-sizing:border-box
}
.s2-to-tree .select2-results__option.l1{
    margin-left:.6em;
    font-size:1em
}
.s2-to-tree .select2-results__option.l2{
    margin-left:1.4em;
    font-size:1em
}
.s2-to-tree .select2-results__option.l3{
    margin-left:2.2em;
    font-size:1em
}
.s2-to-tree .select2-results__option.l4{
    margin-left:3em;
    font-size:1em
}
.s2-to-tree .select2-results__option.l5{
    margin-left:3.8em;
    font-size:1em
}
.s2-to-tree .select2-results__option.l6{
    margin-left:4.5em;
    font-size:1em
}
.s2-to-tree .select2-results__option.l7{
    margin-left:5.3em;
    font-size:1em
}
.s2-to-tree .select2-results__option.l8{
    margin-left:6em;
    font-size:1em
}
.s2-to-tree .select2-dropdown[dir*=rtl] .select2-results__option.l1{
    margin-right:.6em
}
.s2-to-tree .select2-dropdown[dir*=rtl] .select2-results__option.l2{
    margin-right:1.4em
}
.s2-to-tree .select2-dropdown[dir*=rtl] .select2-results__option.l3{
    margin-right:2.2em
}
.s2-to-tree .select2-dropdown[dir*=rtl] .select2-results__option.l4{
    margin-right:3em
}
.s2-to-tree .select2-dropdown[dir*=rtl] .select2-results__option.l5{
    margin-right:3.8em
}
.s2-to-tree .select2-dropdown[dir*=rtl] .select2-results__option.l6{
    margin-right:4.5em
}
.s2-to-tree .select2-dropdown[dir*=rtl] .select2-results__option.l7{
    margin-right:5.3em
}
.s2-to-tree .select2-dropdown[dir*=rtl] .select2-results__option.l8{
    margin-right:6em
}
.s2-to-tree li.select2-results__option{
    padding:5px 10px!important
}
.s2-to-tree li.select2-results__option.select2-results__option--selected,.s2-to-tree li.select2-results__option.select2-results__option--selected:hover{
    background-color:#ddd!important
}
.s2-to-tree li.select2-results__option .expand-collapse{
    position:relative;
    width:10px
}
.s2-to-tree li.select2-results__option .expand-collapse:before{
    width:20px;
    margin-top:-5px
}
.s2-to-tree li.select2-results__option span.item-label{
    flex:1
}
.s2-to-tree li.select2-results__option.non-leaf .expand-collapse:hover{
    color:#000!important;
    cursor:pointer
}
.s2-to-tree li.select2-results__option.non-leaf .expand-collapse:before{
    content:"+";
    position:absolute;
    left:-.35em;
    top:.1em;
    font-size:larger
}
.s2-to-tree .select2-dropdown[dir*=rtl] li.select2-results__option.non-leaf .expand-collapse:before{
    right:-.35em
}
.s2-to-tree li.select2-results__option.non-leaf.opened .expand-collapse:before{
    content:"−"
}
.s2-to-tree .select2-results__option[aria-disabled=true] .expand-collapse{
    color:#000
}
.s2-to-tree .item-label{
    display:inline-block;
    margin:1px;
    margin-left:.5em;
    padding:8px;
    width:calc(100% - 11px)
}
.s2-to-tree .select2-dropdown[dir*=rtl] .item-label{
    margin-right:.5em
}
.s2-to-tree li.select2-results__option{
    position:relative;
    padding:0;
    height:auto;
    overflow-y:hidden
}
.s2-to-tree li.select2-results__option[data-pup]{
    display:none
}
.s2-to-tree li.select2-results__option[data-pup].showme{
    display:block;
    overflow-y:visible
}
.s2-to-tree.select2-container .select2-results__option--highlighted[aria-selected]>span.item-label{
    background-color:#5897fb;
    color:#000!important
}
.s2-to-tree.select2-container li.select2-results__option[aria-selected=true]>span.item-label{
    background-color:#ddd
}
.s2-to-tree.select2-container li.select2-results__option--highlighted[aria-selected],.s2-to-tree.select2-container li.select2-results__option[aria-selected=true]{
    background-color:inherit;
    color:inherit
}
.s2-to-tree li.select2-results__option.l1{
    display:block;
    overflow-y:visible
}
.s2-to-tree.searching-result li.select2-results__option{
    height:auto;
    display:block
}
span.select2-search.select2-search--dropdown {
    padding: 0px !important;
}

input.select2-search__field {
    border: 2px solid transparent !important;
    border-radius: 4px !important;
    border-bottom-left-radius: 0px !important;
    border-bottom-right-radius: 0px !important;
    padding: 10px !important;
}
input.select2-search__field:focus{
    outline: none !important;
    border-color: black !important;
    box-shadow: 0px 3px 5px rgba(0,0,0,0.15);
    position: relative;
    z-index: 1;

}
span.select2-selection,.select2-container--default  .select2-selection__rendered,.select2-container--default  .select2-selection__arrow {min-height: calc(1.5em + 1.3rem + 2px) !important;}span.select2-selection .select2-selection__choice{max-height: calc(1.5em + 1.3rem - 4px) !important;position: relative;top: 2px;line-height: initial !important;display: inline-flex;align-items: center;}
.select2-container{
    display: inline-block !important;
}
.select2-container--default .select2-selection--multiple{
    display: inline !important;
}
.select2-container--default .select2-selection--multiple .select2-selection__rendered .select2-search.select2-search--inline .select2-search__field,
.select2-container--default .select2-selection--multiple .select2-selection__rendered .select2-search.select2-search--inline .select2-search__field:focus{
    outline: none !important;
    margin-top: 7px;
    max-height: 22px !important;
    border-radius: 4px !important;
    padding: 3px !important;
    background: transparent;
    border: 1px solid rgba(0,0,0,0.2) !important;
}
.select2-container--default.select2-container--focus .select2-selection--multiple,
.select2-container--default .select2-selection--multiple{
    border: none !important;
}

span.select2.select2-container.select2-container--default{
    width: 100%;
    border: 1px solid #dddddf;
    border-radius: 4px;
    padding: 2px;
}
.select2-container--default .select2-selection--single{
    border: none;
}
.card{
    border: none !important;
}
.card {
   box-shadow: 0px 10px 50px rgb(0 0 0 / 10%) !important;
   border-radius: 16px !important;
}
.card-header{
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
}
.card-footer{
    border-bottom-left-radius: 16px !important;
    border-bottom-right-radius: 16px !important;
}

.nav.nav-pills .nav-item .nav-link{
    border-radius: 14px;
    padding: 16px 20px;
}
.nav.nav-pills .nav-item .nav-link.active{
    box-shadow: 0px 5px 10px rgb(54 153 255 / 20%);
    z-index: 1;
}
@media only screen and (max-width: 800px){
    .card{
        box-shadow: none !important;
        border-radius: 0px !important;
    }
    .card-body{
        padding: 3px !important;
        padding-top: 10px !important;
        padding-bottom: 10px !important;
    }
    .nav.nav-pills .nav-item .nav-link{
        border-radius: 4px !important;
    }
}
span.select2-container.select2-container--default.select2-container--open {
    z-index: 9999;
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
    RemoteDataSource,
    Loading,
    translate,
    setValidator,
    validate,
    getApiHandler,
    getPermissionBuilder,
    FastUIProvider,
    FastDialog,
    AccessDenied,
    CustomField,
    ReactBridge
};