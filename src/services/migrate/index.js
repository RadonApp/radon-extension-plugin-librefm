import MigrateService from 'neon-extension-framework/services/migrate';
import Plugin from 'neon-extension-destination-librefm/core/plugin';
import Registry from 'neon-extension-framework/core/registry';


export class LibreFmMigrateService extends MigrateService {
    constructor() {
        super(Plugin);
    }
}

// Register service
Registry.registerService(new LibreFmMigrateService());
