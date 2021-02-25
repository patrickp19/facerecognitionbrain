import './App.css';
import React from 'react';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

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
class App extends React.Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
    }
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
  console.log(this.state.input);
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
    response=>this.displayFaceBox(
      this.calculateFaceLocation(response)))
    .catch(err => console.log(err));
}

  render() {
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        
        />
    <Navigation />
    <Logo />
    <Rank />
    <ImageLinkForm 
    onInputChange={this.onInputChange} 
    onButtonSubmit={this.onButtonSubmit}
    />
            
    <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
    </div>
    )
  }
}

export default App;
