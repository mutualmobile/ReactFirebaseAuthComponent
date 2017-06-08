# React-Firebase-Mobx-Auth

### This mobx store handles authentication with firebase


### Setup

In your main app entry point (app.js) use the mobx-react Provider to pass this auth store down the component tree

``` javascript
import React, { Component } from 'react';
import {Scene, Router} from 'react-native-router-flux';
import {AppRegistry} from 'react-native';
import {Provider} from 'mobx-react';
import Routes from './Routes';
import Auth from './stores/Auth';

class App extends React.Component {
  render() {
    return <Provider authorization={Auth}>
      <Routes />
    </Provider>
  }
}
AppRegistry.registerComponent('App', () => App);
module.exports = App;
```


In your router you will want to define your firebase library, a success, and failure function.

``` javascript
import React, { Component } from 'react';
import {Scene, Router, Actions} from 'react-native-router-flux';
import { AppRegistry } from 'react-native';
import Login from './components/views/Login';
import Register from './components/views/Register';
import Home from './components/views/Home';
import {observer} from "mobx-react";
import RNFirebase from './modules/RNFirebase';

@observer(['authorization'])
class Routes extends React.Component {
  componentDidMount() {
    this.props.authorization.bindAuthHandler(
        RNFirebase,
        user =>{
          // successful authentication 
          
          this.props.authorization.saveUser(user);
          this.props.authorization.setFcmToken(user);
          Actions.home()
        },
        ()=>{
          // failed authentication
          Actions.login()
        }
        );
  }
  render() {
    return <Router>
      <Scene key="root">
        <Scene key="login" component={Login} title="Login" initial={true}/>
        <Scene key="register" component={Register} title="Register"/>
        <Scene key="home" component={Home}/>
      </Scene>
    </Router>
  }
}
AppRegistry.registerComponent('Routes', () => Routes);
module.exports = Routes;
```