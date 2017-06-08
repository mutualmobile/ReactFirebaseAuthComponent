import mobx, { computed, observable, action } from "mobx"

import Promise from 'bluebird';

class Auth {
  constructor() {
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

  @action saveUser(user){
    this.user = user || null
    return this.firebaseRef.database().ref(`/users/${user.uid}`).update(user)
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
    return this.firebaseRef.messaging().getToken()
      .then((token) => {
        return this.firebaseRef.database().ref(`/devices/${user.uid}/${token}`).update({type:'ios'});
      });
  }
  @action loginEmailPassword(email, password){
    this.loggingIn = true
    this.firebaseRef.auth().signInWithEmailAndPassword(email, password)
      .then((user) => {
        this.loggingIn = false
        this.loginError = null
      })
      .catch((err) => {
        this.loggingIn = false
        this.loginError = err
      })
  }
  @action registerEmailPassword(person){
    this.registering = true;
    this.firebaseRef.auth().createUserWithEmailAndPassword(person.email, person.password)
      .then((user) => {
        this.registering = false
        this.registrationError = null
      })
      .catch((err) => {
        this.registering = false
        this.registrationError = err
      });
  }

  @action loginFacebook(token, provider) {
    this.loggingIn = true
    let credential
    switch(provider){
      case "facebook":
      credential = this.firebaseRef.auth.FacebookAuthProvider.credential(token);
      break;
    }
    if (!credential) return

    this.firebaseRef.auth().signInWithCredential(credential)
      .then((currentUser) => {
        if (currentUser === 'cancelled') {
          console.log('Login cancelled');
        } else {
          // now signed in
          console.warn(JSON.stringify(currentUser.toJSON()));
        }
        this.loggingIn = false
      })
  }

  @action bindAuthHandler(firebase, success, failure){
    this.firebaseRef = firebase;
     this.firebaseRef.auth().onAuthStateChanged((user) => {
        if (!user){
          failure();
        }else{
          success(user);
        }
    })
  }
  // @action logout() {

  // }
}

const authStore = new Auth();
export default authStore
