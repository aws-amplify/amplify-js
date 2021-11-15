import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import { parse } from 'graphql/language/parser';

import { API } from 'aws-amplify';

const getOperationType = (operation) => {
	const doc = parse(operation);
	const {
		definitions: [{ operation: operationType }],
	} = doc;

	return operationType;
};

interface IConnectProps {
	mutation?: any;
	onSubscriptionMsg?: (prevData: any, data?: any) => any;
	query?: any;
	subscription?: any;
}

interface IConnectState {
	loading: boolean;
	data: any;
	errors: any[];
	mutation: any;
}

export default class Connect extends Component<IConnectProps, IConnectState> {
	subSubscription: any;

	constructor(props: IConnectProps) {
		super(props);

		this.state = this.getInitialState();
		this.subSubscription = null;
	}

	getInitialState() {
		const { query } = this.props;
		return {
			loading: query && !!query.query,
			data: {},
			errors: [],
			mutation: () => console.warn('Not implemented'),
		};
	}

	getDefaultState(): IConnectState {
		return {
			loading: false,
			data: {},
			errors: [],
			mutation: () => console.warn('Not implemented'),
		};
	}

	async _fetchData() {
		this._unsubscribe();
		this.setState({ loading: true });

		const {
			query: { query, variables = {} } = {},
			mutation: { query: mutation, mutationVariables = {} } = {},
			subscription,
			onSubscriptionMsg = (prevData) => prevData,
		} = this.props;

		let { data, mutation: mutationProp, errors } = this.getDefaultState();

		const hasValidQuery = query && getOperationType(query) === 'query';
		const hasValidMutation = mutation && getOperationType(mutation) === 'mutation';
		const hasValidSubscription = subscription && getOperationType(subscription.query) === 'subscription';

		if (!hasValidQuery && !hasValidMutation && !hasValidSubscription) {
			console.warn('No query, mutation or subscription was specified');
		}

		if (hasValidQuery) {
			try {
				data = null;

				const response = await API.graphql({
					query,
					variables,
				});

				// @ts-ignore
				data = response.data;
			} catch (err) {
				data = err.data;
				errors = err.errors;
			}
		}

		if (hasValidMutation) {
			mutationProp = async (variables) => {
				const result = await API.graphql({
					query: mutation,
					variables,
				});

				this.forceUpdate();
				return result;
			};
		}

		if (hasValidSubscription) {
			const { query: subsQuery, variables: subsVars } = subscription;

			try {
				const observable = API.graphql({
					query: subsQuery,
					variables: subsVars,
				});

				// @ts-ignore
				this.subSubscription = observable.subscribe({
					next: ({ value: { data } }) => {
						const { data: prevData } = this.state;
						const newData = onSubscriptionMsg(prevData, data);
						this.setState({ data: newData });
					},
					error: (err) => console.error(err),
				});
			} catch (err) {
				errors = err.errors;
			}
		}

		this.setState({
			data,
			errors,
			mutation: mutationProp,
			loading: false,
		});
	}

	_unsubscribe() {
		if (this.subSubscription) {
			this.subSubscription.unsubscribe();
		}
	}

	async componentDidMount() {
		this._fetchData();
	}

	componentWillUnmount() {
		this._unsubscribe();
	}

	componentDidUpdate(prevProps: IConnectProps) {
		const { loading } = this.state;

		const { query: newQueryObj, mutation: newMutationObj } = this.props;
		const { query: prevQueryObj, mutation: prevMutationObj } = prevProps;

		// query
		const { query: newQuery, variables: newQueryVariables } = newQueryObj || {};
		const { query: prevQuery, variables: prevQueryVariables } = prevQueryObj || {};
		const queryChanged =
			prevQuery !== newQuery || JSON.stringify(prevQueryVariables) !== JSON.stringify(newQueryVariables);

		// mutation
		const { query: newMutation, variables: newMutationVariables } = newMutationObj || {};
		const { query: prevMutation, variables: prevMutationVariables } = prevMutationObj || {};
		const mutationChanged =
			prevMutation !== newMutation || JSON.stringify(prevMutationVariables) !== JSON.stringify(newMutationVariables);

		if (!loading && (queryChanged || mutationChanged)) {
			this._fetchData();
		}
	}

	render() {
		const { data, loading, mutation, errors } = this.state;

		return (
			// @ts-ignore
			this.props.children({
				data,
				errors,
				loading,
				mutation,
			}) || null
		);
	}
}
