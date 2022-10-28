// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	private connectionStatesTranslator({
		connectionState,
		networkState,
		intendedConnectionState,
		keepAliveState,
	}: LinkedConnectionStates): ConnectionState {
		if (connectionState === 'connected' && networkState === 'disconnected')
			return ConnectionState.ConnectedPendingNetwork;

		if (
			connectionState === 'connected' &&
			intendedConnectionState === 'disconnected'
		)
			return ConnectionState.ConnectedPendingDisconnect;

		if (
			connectionState === 'disconnected' &&
			intendedConnectionState === 'connected' &&
			networkState === 'disconnected'
		)
			return ConnectionState.ConnectionDisruptedPendingNetwork;

		if (
			connectionState === 'disconnected' &&
			intendedConnectionState === 'connected'
		)
			return ConnectionState.ConnectionDisrupted;

		if (connectionState === 'connected' && keepAliveState === 'unhealthy')
			return ConnectionState.ConnectedPendingKeepAlive;

		// All remaining states directly correspond to the connection state
		if (connectionState === 'connecting') return ConnectionState.Connecting;
		if (connectionState === 'disconnected') return ConnectionState.Disconnected;
		return ConnectionState.Connected;
	}
}
