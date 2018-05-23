import Client from './Client';
import Plugin from '../Core/Plugin';


export default class Account {
    static refresh() {
        return Client['user'].getInfo().then((account) => {
            // Store account details
            Plugin.storage.putObject('account', account);

            return account;
        }, (body, statusCode) => {
            return Promise.reject(new Error(
                'Unable to retrieve account settings, response with status code ' + statusCode + ' returned'
            ));
        });
    }
}
