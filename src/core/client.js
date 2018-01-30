import {Client as LibreFM} from '@fuzeman/librefm/src/index';

import Plugin from './plugin';


const Client = new LibreFM(
    'qhSerf93lrPD2zRFeJDiZeIElFTV3RFp',
    'fQZlhZleyl2E6BFLp3RP5668TalIhMnZ'
);

function configure() {
    // Update client with current session
    return Plugin.storage.getObject('session').then((session) => {
        Client.session = session;
    });
}

// Configure client on session changes
Plugin.storage.onChanged('session', configure);

// Initial client configuration
configure();

export default Client;
