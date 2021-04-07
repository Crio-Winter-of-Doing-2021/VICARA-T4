import React, { Component } from 'react';
import { Player, ControlBar, PlaybackRateMenuButton ,BigPlayButton} from 'video-react';
import "../../../node_modules/video-react/dist/video-react.css";

export default class PlaybackRateMenuButtonExmaple extends Component {
  componentDidMount() {
    this.player.playbackRate = 2;
    this.forceUpdate();
  }

  render() {
    return (
      <Player
        autoPlay
        ref={c => {
          this.player = c;
        }}
        playsInline
      >
        <BigPlayButton position="center" />
        <source
          src={this.props.url}
          type="video/mp4"
        />
        <ControlBar>
          <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} />
        </ControlBar>
      </Player>
    );
  }
}