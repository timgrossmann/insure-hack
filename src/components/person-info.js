import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import zurich from '../utils/zurich';


export default class PersonInfo extends Component {

  constructor (props, context) {
    super(props, context);

    this.props.chat.insuranceID = '10000000024';

    this.loadCustomer();

    this.state = {
      customer: null
    };
  }


  loadCustomer () {
    if (this.props.chat.insuranceID) {
      zurich.getCustomer(this.props.chat.insuranceID).done((data) => {
        this.setState({ customer: data.value[0] });
      });
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.chat.insuranceID !== this.props.chat.insuranceID) {
      loadCustomer();
    }
  }

  render () {
    const { onClose, chat } = this.props;
    const { customer } = this.state;

    let content;

    if (chat.insuranceID) {
      content = <InsuranceDetails chat={chat} customer={customer} />
    } else {
      content = (
        <Card>
          <CardHeader
            title={`${chat.name}`}
            avatar={chat.img}
          />
          <CardText>This person has no associated account number.</CardText>
        </Card>
      );
    }

    return (
      <div className='PersonInfo'>

        <div className='SubHeader'>
          <h1>Info</h1>
          <FlatButton
            style={{ color: '#fff' }}
            label="close"
            onClick={() => onClose()}/>
        </div>

        <div className='PersonInfo__content'>
          {content}
        </div>
      </div>
    );
  }
}

function InsuranceDetails ({chat, customer}) {
  let details;
  let name = chat.name;

  if (!customer) {
    details = <div className='centered' ><CircularProgress /></div>;
  } else {
    let { FirstName, LastName, DateOfBirth } = customer.AccountHolderContact;
    name = FirstName + ' ' + LastName;
    details = (
      <table className='InfoTable'>
        <tbody>
          <tr>
            <th>account number</th>
            <td>{customer.AccountNumber}</td>
          </tr>
          <tr>
            <th>date of birth</th>
            <td>{DateOfBirth}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <Card>
      <CardHeader
        title={name}
        avatar={chat.img}
      />
      <CardText>
        {details}
      </CardText>
    </Card>
  )
}