import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Particles from 'react-particles-js';
import Register from './components/Register/Register';
import Clarifai from 'clarifai';
import './App.css';

const app = new Clarifai.App({apiKey: ''});

const particlesOptions = {
  particles: {
    number:{
      value: 80,
      density:{
        enable:true,
        value_area: 600
      }
    },
    size:{
      value: 3
    }
  }
}


class App extends Component {
  constructor(){
    super();
    this.state={
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState ({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    console.log("data: ", data);
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log("height: ", height, "width: " , width);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box:box});
    console.log(box);
  }
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPicktureSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input
      )
      .then(response => {
        if (response) {
          fetch('http://localhost:3000/image',{
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => { // response 받은 count를 user{entries:count}형식으로 업데이트시 user전체 갱신되어 저장해놓은 나머지 user데이터 날아감
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState({isSignedIn : false})
    } else if(route === 'home'){
      this.setState({isSignedIn : true})
    }
    this.setState({route: route});
  }

  render(){
    const  {isSignedIn, imageUrl, route, box, user} = this.state;
      return (
        <div className="App">
          <Particles className='particles'
                params={particlesOptions}
                 />
          <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
          <Logo />
            {route === 'home'
             ? <div>
                <Rank name = {user.name} entries = {user.entries}/>
                <ImageLinkForm
                  onInputChange={this.onInputChange}
                  onPicktureSubmit={this.onPicktureSubmit}
                />
                <FaceRecognition box={box} imageUrl={imageUrl}/>
              </div>
              : (
                  route ==='register'
                  ? <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
                  : <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
              )

         }
        </div>
      );
    }
}

export default App;
