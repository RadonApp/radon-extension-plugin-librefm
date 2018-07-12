import Merge from 'lodash-es/merge';

import {PluginOption} from '@radon-extension/framework/Models/Configuration/Options';


export default class AuthenticationOption extends PluginOption {
    constructor(plugin, key, options) {
        super(plugin, 'authentication', key, Merge({
            componentId: 'services.configuration:authentication'
        }, options));
    }
}
