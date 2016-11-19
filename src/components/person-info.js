import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';

export default class PersonInfo extends Component {

  render () {
    const { onClose, chat } = this.props;

    const {
      anrede, vorname, nachname, kundenNr, familienstand, geburtsdatum, geschlecht, staatsangehoerigkeit,
      Telekom, PartnerAdresse
    } = {
      "anrede": "Frau",
      "kundenNr": "03028670",
      "partnerOid": "3013733353753132",
      "PartnerRolle": [{
        "rang": 1,
        "rollenArt": { "schluessel": "RE", "schluesselName": "ITRollenArt", "wert": "Rechnungsempfänger" },
        "versicherungsscheinnummer": "01LV03028670"
      }, {
        "rang": 0,
        "rollenArt": { "schluessel": "VN", "schluesselName": "ITRollenArt", "wert": "Versicherungsnehmer" },
        "versicherungsscheinnummer": "01LV03028670"
      }],
      "Telekom": [{
        "kommunikationsArt": { "schluessel": "", "schluesselName": null, "wert": "unbekannt" },
        "verwendungsart": null,
        "adresse": "dummy@zurich.com"
      }],
      "PartnerAdresse": [{
        "adressStatusKey": null,
        "Adresse": {
          "adresszusatz1": null,
          "adresszusatz2": null,
          "hausnummer": "1",
          "laenderkennzeichen": null,
          "ort": "Waldkirchen",
          "ortszusatz": "",
          "postfach": "",
          "postleitzahl": "4085",
          "strasse": "Bahnhofstrasse",
          "strassenZusatz": null
        }
      }],
      "adelstitel": null,
      "akademischerTitel": null,
      "familienstand": { "schluessel": "2", "schluesselName": "ITFamilienStand", "wert": "verheiratet" },
      "geburtsdatum": "1978-09-07",
      "geburtsName": "",
      "geschlecht": { "schluessel": "W", "schluesselName": "ITGeschlecht", "wert": "weiblich" },
      "nachname": "Gladick",
      "namensnachsatz": "",
      "namensvorsatz": "",
      "staatsangehoerigkeit": { "schluessel": "D", "schluesselName": "LS-ADR", "wert": "Deutschland" },
      "sterbedatum": null,
      "vorname": "Jona",
      "name_1": null,
      "name_2": null
    };

    return (
      <div className='PersonInfo'>

        <div className='SubHeader'>
          <h1>Info</h1>
          <FlatButton style={{ color: '#fff' }} label="close" onClick={() => onClose()}/>
        </div>

        <div className='PersonInfo__content'>
          <Card>
            <CardHeader
              title={`${anrede} ${vorname} ${nachname}`}
              subtitle={kundenNr}
              avatar={chat.img}
            />
            <CardText>


              <table className='InfoTable'>
                <tbody>
                  <tr>
                    <th>birth date</th><td>{geburtsdatum}</td>
                  </tr>
                  <tr>
                    <th>gender</th><td>{geschlecht.wert}</td>
                  </tr>
                  <tr>
                    <th>nationality</th><td>{staatsangehoerigkeit.wert}</td>
                  </tr>
                  <tr>
                    <th>marital status</th><td>{familienstand.wert}</td>
                  </tr>
                </tbody>
              </table>


            </CardText>
          </Card>



        </div>


      </div>
    );
  }

}