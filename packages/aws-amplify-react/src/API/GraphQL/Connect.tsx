import * as React from 'react';
import { API } from '@aws-amplify/api';

export interface IConnectProps {
	mutation?: any;
	onSubscriptionMsg?: (prevData: any, data: any) => any;
	query?: any;
	subscription?: any;
}

export interface IConnectState {
	loading: boolean;
	data: any;
	errors: any;
	mutation: any;
}

export class Connect extends React.Component<IConnectProps, IConnectState> {
	public subSubscription;
	private mounted: boolean;

	constructor(props) {
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

	getDefaultState() {
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
			// @ts-ignore
			query: { query, variables = {} } = {},
			// @ts-ignore
			mutation: { query: mutation, mutationVariables = {} } = {},
			subscription,
			onSubscriptionMsg = (prevData) => prevData,
		} = this.props;

		let { data, mutation: mutationProp, errors } = this.getDefaultState();

		if (
			!API ||
			typeof API.graphql !== 'function' ||
			typeof API.getGraphqlOperationType !== 'function'
		) {
			throw new Error(
				'No API module found, please ensure @aws-amplify/api is imported'
			);
		}

		const hasValidQuery =
			query && API.getGraphqlOperationType(query) === 'query';
		const hasValidMutation =
			mutation && API.getGraphqlOperationType(mutation) === 'mutation';
		const hasValidSubscription =
			subscription &&
			API.getGraphqlOperationType(subscription.query) === 'subscription';

		if (!hasValidQuery && !hasValidMutation && !hasValidSubscription) {
			console.warn('No query, mutation or subscription was specified');
		}

		if (hasValidQuery) {
			try {
				data = null;

				const response = await API.graphql({ query, variables });

				// @ts-ignore
				data = response.data;
			} catch (err) {
				data = err.data;
				errors = err.errors;
			}
		}

		if (hasValidMutation) {
			// @ts-ignore
			mutationProp = async (variables) => {
				const result = await API.graphql({ query: mutation, variables });

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
						if (this.mounted) {
							this.setState({ data: newData });
						}
					},
					error: (err) => console.error(err),
				});
			} catch (err) {
				errors = err.errors;
			}
		}

		this.setState({ data, errors, mutation: mutationProp, loading: false });
	}

	_unsubscribe() {
		if (this.subSubscription) {
			this.subSubscription.unsubscribe();
		}
	}

	async componentDidMount() {
		this._fetchData();
		this.mounted = true;
	}

	componentWillUnmount() {
		this._unsubscribe();
		this.mounted = false;
	}

	componentDidUpdate(prevProps) {
		const { loading } = this.state;

		const { query: newQueryObj, mutation: newMutationObj } = this.props;
		const { query: prevQueryObj, mutation: prevMutationObj } = prevProps;

		// query
		// @ts-ignore
		const { query: newQuery, variables: newQueryVariables } = newQueryObj || {};
		// @ts-ignore
		const { query: prevQuery, variables: prevQueryVariables } =
			prevQueryObj || {};
		const queryChanged =
			prevQuery !== newQuery ||
			JSON.stringify(prevQueryVariables) !== JSON.stringify(newQueryVariables);

		// mutation
		// @ts-ignore
		const { query: newMutation, variables: newMutationVariables } =
			newMutationObj || {};
		// @ts-ignore
		const { query: prevMutation, variables: prevMutationVariables } =
			prevMutationObj || {};
		const mutationChanged =
			prevMutation !== newMutation ||
			JSON.stringify(prevMutationVariables) !==
				JSON.stringify(newMutationVariables);

		if (!loading && (queryChanged || mutationChanged)) {
			this._fetchData();
		}
	}

	render() {
		const { data, loading, mutation, errors } = this.state;
		// @ts-ignore
		return this.props.children({ data, errors, loading, mutation }) || null;
	}
}

/**
 * @deprecated use named import
 */
export default Connect;
