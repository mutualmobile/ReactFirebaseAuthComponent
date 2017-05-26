import mobx, { computed, observable, action } from "mobx"
import RNFirebase from './../modules/RNFirebase';
import Promise from 'bluebird';
import { Actions } from 'react-native-router-flux'

class Auth {
  constructor() {
   this.bindAuthHandler()
  }

  @observable authorization = null
  @observable user = null
  @observable loggingIn = false
  @observable loginError = null
  @observable registering = false
  @observable registrationError = null

  @computed get isAuthenticated() {
    return this.user ? true : false
  }

  @action saveAuth(user){
    console.log("saving user to database",  user)
    return RNFirebase.database().ref(`/users/${user.uid}`).update(user)
  }
  @action setUser(user){
    console.log("SET USER ACTION TRIGGERED")
    this.user = user || null
  }
  @action setToken(token) {
    this.authorization = `Bearer ${token}`
  }
  @computed get getToken() {
    if (this.authorization) {
      return this.authorization.match(/(?:Bearer\s+)?(\w+\.\w+\.\w+)/)[1]
    } else {
      return null
    }
  }

  @action setFcmToken(user) {
    return RNFirebase.messaging().getToken()
      .then((token) => {
        console.log('Device FCM Token: ', token);
        return RNFirebase.database().ref(`/devices/${user.uid}/${token}`).update({type:'ios'});
      });
  }

  @action bindAuthHandler(){
     RNFirebase.auth().onAuthStateChanged((user) => {
        if (!user){
          Actions.login()
        }else{
          //TODO: check if current scene is login, if so then send to home.
          this.setUser(user);
          this.setFcmToken(user);
          Actions.home();
        }

    })
  }
  // @action logout() {

  // }
}

const authStore = new Auth();
export default authStore
