import { makeAutoObservable, observable, computed, action } from "mobx";
import htmlToJsx from "./HtmlToJsx";
import { ButtonView } from "ckeditor5/src/ui";
import { observer } from "mobx-react";
import { useContext } from "react";

class Store {
  
  jsx = null
  html = null
  collapsed = false;
  modalVisible = false;
  tree = null;
  treeLoad = false;
  saveModal = false;
  deleteNotification = false;

  constructor() {
    makeAutoObservable(this);
  }

  setJsx = (value) => {
    this.jsx = value;
  }

  setHtml = (value) => {
    this.html = value;
  }

  setCollapsed = (value) => {
    this.collapsed = value;
  }

  setModalVisible = (value) => {
    this.modalVisible = value;
  }

  setTree = (value) => {
    this.tree = value;
  }

  setTreeLoad = (value) => {
    this.treeLoad = value;
  }

  setSaveModal = (value) => {
    this.saveModal = value;
  }

  // !
  // !
  // !



}

export default Store;