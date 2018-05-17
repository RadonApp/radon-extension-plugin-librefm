import Merge from 'lodash-es/merge';

import {PluginOption} from 'neon-extension-framework/services/configuration/models';


export default class AuthenticationOption extends PluginOption {
    constructor(plugin, key, options) {
        super(plugin, 'authentication', key, Merge({
            componentId: 'services.configuration:authentication'
        }, options));
    }
}
