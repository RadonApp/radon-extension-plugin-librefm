import IsNil from 'lodash-es/isNil';
import React from 'react';
import Runtime from 'wes/runtime';
import Uuid from 'uuid';

import Registry from 'neon-extension-framework/Core/Registry';
import TranslationNamespace from 'neon-extension-framework/Components/Translation/Namespace';
import {OptionComponent} from 'neon-extension-framework/Components/Configuration';
import Account from 'neon-extension-destination-librefm/Api/Account';
import Client from 'neon-extension-destination-librefm/Api/Client';
import Log from 'neon-extension-destination-librefm/Core/Logger';
import Plugin from 'neon-extension-destination-librefm/Core/Plugin';

import './AuthenticationOptionComponent.scss';


export default class AuthenticationOptionComponent extends OptionComponent {
    constructor() {
        super();

        this.messaging = null;

        // Initial state
        this.state = {
            id: null,
            namespaces: [],

            authenticated: false,
            subscribed: false,
            account: {}
        };
    }

    componentWillUnmount() {
        // Close messaging service
        if(!IsNil(this.messaging)) {
            this.messaging.close();
            this.messaging = null;
        }
    }

    componentWillMount() {
        // Retrieve messaging service
        this.messaging = Plugin.messaging.service('authentication');

        // Subscribe to service
        this.messaging.subscribe().then(
            () => this.setState({ subscribed: true }),
            () => this.setState({ subscribed: false })
        );

        // Fetch initial state
        this.refresh(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.refresh(nextProps);
    }

    onLoginClicked(t) {
        // Bind to callback event
        this.messaging.once('callback', this.onCallback.bind(this, t));

        // Generate callback id (to validate against received callback events)
        this.callbackId = Uuid.v4();

        // Open authorization page
        window.open(Client['auth'].getAuthorizeUrl({
            callbackUrl: Runtime.getURL(
                '/destination/librefm/callback/callback.html?id=' + this.callbackId
            )
        }), '_blank');
    }

    onCallback(t, query) {
        if(query.id !== this.callbackId) {
            Log.warn('Unable to authenticate with Libre.fm: Invalid callback id');

            // Emit error event
            this.messaging.emit('error', {
                'title': t(`${this.props.item.key}.error.id.title`),
                'description': t(`${this.props.item.key}.error.id.description`)
            });

            return;
        }

        // Request session key
        Client['auth'].getSession(query.token).then((session) => {
            // Update client authorization
            Client.session = session;

            // Update authorization token
            return Plugin.storage.putObject('session', session)
                // Refresh account details
                .then(() => this.refreshAccount())
                .then(() => {
                    // Emit success event
                    this.messaging.emit('success');
                });

        }, (error) => {
            Log.warn('Unable to authenticate with Libre.fm: %s', error.message);

            // Emit error event
            this.messaging.emit('error', {
                'title': t(`${this.props.item.key}.error.request.title`),
                'description': error.message
            });
        });
    }

    refresh(props) {
        this.setState({
            id: props.item.id,

            namespaces: [
                props.item.namespace,
                props.item.plugin.namespace
            ]
        });

        // Retrieve account details
        Plugin.storage.getObject('account')
            .then((account) => {
                if(IsNil(account)) {
                    return;
                }

                this.setState({
                    authenticated: true,
                    account: account
                });
            });
    }

    refreshAccount() {
        // Fetch account details
        return Account.refresh().then((account) => {
            // Update state
            this.setState({
                authenticated: true,
                account: account
            });

            return account;
        }, (e) => {
            // Clear authorization
            return this.logout().then(() => {
                return Promise.reject(e);
            });
        });
    }

    logout() {
        // Reset libre.fm client
        Client.session = null;

        // Clear token and account details from storage
        return Plugin.storage.put('session', null)
            .then(() => Plugin.storage.put('account', null))
            .then(() => {
                // Update state
                this.setState({
                    authenticated: false,
                    account: {}
                });
            });
    }

    render() {
        if(this.state.authenticated) {
            // Logged in
            let account = this.state.account;

            return (
                <TranslationNamespace ns={this.state.namespaces}>
                    {(t) => (
                        <div data-component={Plugin.id + ':authentication'} className="box active">
                            <div className="shadow"/>

                            <div className="inner">
                                <div className="avatar" style={{
                                    backgroundImage: 'url(' + account.image[account.image.length - 1]['#text'] + ')'
                                }}/>

                                <div className="content">
                                    <h3 className="title">{account.realname || account.name}</h3>

                                    <div className="actions">
                                        <button
                                            type="button"
                                            className="button secondary small"
                                            onClick={this.refreshAccount.bind(this)}>
                                            {t(`${this.props.item.key}.button.refresh`)}
                                        </button>

                                        <button
                                            type="button"
                                            className="button secondary small"
                                            onClick={this.logout.bind(this)}>
                                            {t(`${this.props.item.key}.button.logout`)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </TranslationNamespace>
            );
        }

        // Logged out
        return (
            <TranslationNamespace ns={this.state.namespaces}>
                {(t) => (
                    <div data-component={Plugin.id + ':authentication'} className="box login">
                        <div className="inner">
                            <button
                                type="button"
                                className="button small"
                                disabled={!this.state.subscribed}
                                onClick={this.onLoginClicked.bind(this, t)}>
                                {t(`${this.props.item.key}.button.login`)}
                            </button>
                        </div>
                    </div>
                )}
            </TranslationNamespace>
        );
    }
}

AuthenticationOptionComponent.componentId = Plugin.id + ':services.configuration:authentication';

// Register option component
Registry.registerComponent(AuthenticationOptionComponent);
