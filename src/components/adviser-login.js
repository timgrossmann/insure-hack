import _ from 'lodash';
import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import MenuItem from 'material-ui/MenuItem';

export default class AdviserLogin extends Component{

  constructor (props, context) {
    super(props, context);

    this.state = {
      selectedAdviser: null,
    };
  }

  handleChange (value) {
    console.log(value);

    this.setState({
      selectedAdviser: _.find(this.props.advisers, ({id}) => id === value)
    });
  }

  render () {
    const { advisers, onLogin } = this.props;
    const { selectedAdviser } = this.state;

    const optionsHTML = _.map(advisers, ({id, name}) => (
      <MenuItem value={id} primaryText={name} key={id}/>
    ));

    return (
      <div className='MainSidebar__content'>
        <Card>
          <CardText>
            <DropDownMenu value={selectedAdviser && selectedAdviser.id}
                          onChange={(evt, pos, value) => this.handleChange(value)}
                          autoWidth={false}
                          style={{width: '100%'}}>
              {optionsHTML}
            </DropDownMenu>

            <br/>
            <br/>

            <RaisedButton label="login"
                          fullWidth={true}
                          onClick={() => onLogin(selectedAdviser)}
                          disabled={!selectedAdviser}/>
          </CardText>
        </Card>
      </div>
    )
  }
}