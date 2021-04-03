import React, { Component } from "react"
import { frontURL } from "../../axios"
import Button from '@material-ui/core/Button';

export default class Clipboard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      copySuccess: false
    }
  }

  copyCodeToClipboard = () => {
    const el = this.textArea
    el.select()
    document.execCommand("copy")
    this.setState({copySuccess: true})
  }

  render() {
    return (
      <div style={{marginBottom:"15px"}}>
        <div>
          <textarea
            cols={65}
            rows={1}
            ref={(textarea) => this.textArea = textarea}
            value={`${frontURL}/share/${this.props.type}/${this.props.id}`}
            style={{border:"1px dashed grey",padding:"5px",borderRadius:"5px",fontWeight:"bold"}}
          />
        </div>
        <div>
          <Button size="small" style={{fontWeight:"bold"}} onClick={() => this.copyCodeToClipboard()} variant="outlined" color="primary">
            Copy
          </Button>
          {
            this.state.copySuccess ?
            <div style={{"color": "green",fontWeight:"bold"}}>
              Success!
            </div> : null
          }
        </div>
      </div>
    )
  }
}