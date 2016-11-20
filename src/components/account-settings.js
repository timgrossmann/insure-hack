import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Toggle from 'material-ui/toggle';
import Checkbox from 'material-ui/checkbox';


export default class AccountSettings extends Component {

  render () {
    const { adviser, onChangeHolidayMode } = this.props;

    return (
      <div className='MainSidebar__content'>
        <Card>
          <CardHeader title='Holiday Mode'/>
          <CardText>
            <Toggle
              label="I'm on vacation :)"
              labelPosition="right"
              onToggle={() => onChangeHolidayMode(!adviser.onHoliday)}
              toggled={adviser.onHoliday}
            />
          </CardText>
        </Card>
      </div>
    );
  }
}