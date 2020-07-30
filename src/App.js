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

const app = new Clarifai.App({apiKey: 'ab1b946067e3440b934e808dc0891746'});

/*
app = ClarifaiApp(api_key='ab1b946067e3440b934e808dc0891746')
new ClarifaiBuilder("ab1b946067e3440b934e808dc0891746").buildSync();
using System.Threading.Tasks;
using Clarifai.API;

namespace YourNamespace
{
    public class YourClassName
    {
        public static async Task Main()
        {
            var client = new ClarifaiClient("ab1b946067e3440b934e808dc0891746");
        }
    }
}
ClarifaiApp *app = [[ClarifaiApp alloc] initWithApiKey:@"ab1b946067e3440b934e808dc0891746"];
use Clarifai\API\ClarifaiClient;

$client = new ClarifaiClient('ab1b946067e3440b934e808dc0891746');
curl -X POST \
  -H 'Authorization: Key ab1b946067e3440b934e808dc0891746' \
  -H "Content-Type: application/json" \
  -d '

*/
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
      isSignedIn: false
    }
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

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
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
    const  {isSignedIn, imageUrl, route, box} = this.state;
      return (
        <div className="App">
          <Particles className='particles'
                params={particlesOptions}
                 />
          <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
          <Logo />
            {route === 'home'
             ? <div>
                <Rank />
                <ImageLinkForm
                  onInputChange={this.onInputChange}
                  onButtonSubmit={this.onButtonSubmit}
                />
                <FaceRecognition box={box} imageUrl={imageUrl}/>
              </div>
              : (
                  route ==='register'
                  ? <Register onRouteChange={this.onRouteChange} />
                  : <SignIn onRouteChange={this.onRouteChange} />
              )

         }
        </div>
      );
    }
}

export default App;
