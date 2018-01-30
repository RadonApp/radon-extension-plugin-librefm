import {Client as LibreFM} from '@fuzeman/librefm/src/index';

import Plugin from './plugin';


const Client = new LibreFM(
    '2c794d3b3415a2fb072f41fc8a8edcc7',
    '92a0a2adaf14f954e8d8999a9fb95524'
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
