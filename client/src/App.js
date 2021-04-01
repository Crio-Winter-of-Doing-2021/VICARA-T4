import React, { Component } from "react";
import GoogleLogin from "react-google-login";

import googleLogin from "./googleLogin";

class App extends Component {
  render() {
    const responseGoogle = async (response) => {
      // let googleResponse = await googleLogin(response.accessToken);
      // console.log(googleResponse);
      console.log(response);
    };

    return (
      <div className="App">
        <h1>LOGIN WITH FACEBOOK AND GOOGLE</h1>

        <GoogleLogin
          clientId="575084088742-2eidkevqutnod9lord9vf2sri50ko7ct.apps.googleusercontent.com"
          buttonText="LOGIN WITH GOOGLE"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
        />
      </div>
    );
  }
}

export default App;
