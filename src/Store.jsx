import { makeAutoObservable} from "mobx";

class Store {
  
  jsx = null
  html = null
  collapsed = false;
  modalVisible = false;
  tree = null;
  treeLoad = false;
  saveModal = false;
  showTour = false;  

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

  setShowTour = (value) => {
    this.showTour = value;
  }

  // !
  // !
  // !

}

export default Store;