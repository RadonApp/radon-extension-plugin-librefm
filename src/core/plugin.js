import DestinationPlugin from 'neon-extension-framework/base/plugins/destination';


export class LibreFmPlugin extends DestinationPlugin {
    constructor() {
        super('librefm');
    }
}

export default new LibreFmPlugin();
