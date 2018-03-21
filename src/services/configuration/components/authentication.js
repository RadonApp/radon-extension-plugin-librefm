import IsNil from 'lodash-es/isNil';
import React from 'react';
import Runtime from 'wes/runtime';
import Uuid from 'uuid';

import Registry from 'neon-extension-framework/core/registry';
import {OptionComponent} from 'neon-extension-framework/services/configuration/components';

import Account from '../../../core/account';
import Client from '../../../core/client';
import Log from '../../../core/logger';
import Plugin from '../../../core/plugin';
import './authentication.scss';


export default class AuthenticationComponent extends OptionComponent {
    constructor() {
        super();

        this.messaging = null;

        // Initial state
        this.state = {
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

    onLoginClicked() {
        // Bind to callback event
        this.messaging.once('callback', this.onCallback.bind(this));

        // Generate callback id (to validate against received callback events)
        this.callbackId = Uuid.v4();

        // Open authorization page
        window.open(Client['auth'].getAuthorizeUrl({
            callbackUrl: Runtime.getURL(
                '/destination/librefm/callback/callback.html?id=' + this.callbackId
            )
        }), '_blank');
    }

    onCallback(query) {
        if(query.id !== this.callbackId) {
            Log.warn('Unable to authenticate with Libre.fm: Invalid callback id');

            // Emit error event
            this.messaging.emit('error', {
                'title': 'Invalid callback id',
                'description': 'Please ensure you only click the "Login" button once.'
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
                .then(() => this.refresh())
                .then(() => {
                    // Emit success event
                    this.messaging.emit('success');
                });

        }, (error) => {
            Log.warn('Unable to authenticate with Libre.fm: %s', error.message);

            // Emit error event
            this.messaging.emit('error', {
                'title': 'Unable to request authentication session',
                'description': error.message
            });
        });
    }

    refresh() {
        // Ensure client has been initialized
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
                <div data-component={Plugin.id + ':authentication'} className="box active">
                    <div className="shadow"></div>

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
                                    onClick={this.refresh.bind(this)}>
                                    Refresh
                                </button>

                                <button
                                    type="button"
                                    className="button secondary small"
                                    onClick={this.logout.bind(this)}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Logged out
        return (
            <div data-component={Plugin.id + ':authentication'} className="box login">
                <div className="inner">
                    <button
                        type="button"
                        className="button small"
                        disabled={!this.state.subscribed}
                        onClick={this.onLoginClicked.bind(this)}>
                        Login
                    </button>
                </div>
            </div>
        );
    }
}

AuthenticationComponent.componentId = Plugin.id + ':services.configuration:authentication';

// Register option component
Registry.registerComponent(AuthenticationComponent);
