import './App.css';
import React from 'react';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

const app = new Clarifai.App({apiKey: 'fa6d764827b54e9d9c20638110ddf906'});


const particlesOptions = {
  particles: {
    // line_linked: {
    //   shadow: {
    //     enable: true,
    //     color: "#3CA9D1",
    //     blur: 5
    //   }
    // },
    number: {
      value: 50,
      density: {
        enable: true,
        value_area: 450
      }
    }
  }
          
}

const initialState = {
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
class App extends React.Component {
  constructor(){
    super();
    this.state = initialState;
  }

  // componentDidMount(){
  //   fetch('http://localhost:3000/')
  //   .then(resp => resp.json())
  //   .then(data => console.log(data))
  // }

loadUser = (data) => {
  this.setState({user: {
    id: data.id,
    name: data.name,
    email: data.email,
    entries: data.entries,
    joined: data.joined
  }})
}

calculateFaceLocation = (data) => {
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  console.log(clarifaiFace);
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  console.log(width, height);
  return{
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottom_row*height)

  }
}

displayFaceBox = (box) => {
  console.log(box);
  this.setState({ box });
}
onInputChange = (event) =>{
  // console.log(this.state.input);
  this.setState({input: event.target.value});
}

onButtonSubmit = () => {
  this.setState({imageUrl: this.state.input})
  app.models.predict(
    Clarifai.FACE_DETECT_MODEL,
    this.state.input)
  .then(
    // function(response) {
    //   console.log(response);
    //   this.calculateFaceLocation(response);
    //   // console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
    // }
    (response)=>{
      if (response) {
        fetch('http://localhost:3000/image/', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count=> {
        this.setState(Object.assign(this.state.user, { entries: count}))
      })
      .catch(console.log)
    }

      this.displayFaceBox(
      this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
}

onRouteChange = (route) => {
  if (route === 'signin'){
    this.setState(initialState)
  } else if (route === 'home') {
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
  // console.log(this.state.input);
  // console.log(this.state.route);
}
  render() {
    //const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        
        />
    <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
    { this.state.route ==='home' 
      ? <div>
          <Logo />
         <Rank name={this.state.user.name} entries={this.state.user.entries}/>
         <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}
          />
              
        <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
      </div>
      : (
          this.state.route ==='signin'
          ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
    }

    </div>
    )
  }
}

export default App;
