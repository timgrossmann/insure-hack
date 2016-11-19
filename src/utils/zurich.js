import $ from 'jquery';

const token = '131ac945-2259-3e6b-95c5-8035f3c30cb6';

export default {
  getCustomer () {
    return $.ajax({
      url: 'https://api.insurhack.com/apis/gi/1/Account_Set',
      data: {
        '$expand': 'AccountHolderContact,Policies($expand=LatestPeriod)',
        '$filter': 'AccountNumber eq \'10000000024\''
      },

      headers: {
        'Authorization': `Bearer ${token}`
      },

      type: 'GET'
    });
  }
}

