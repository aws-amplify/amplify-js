// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type Store<State, Action> = (reducer: Reducer<State, Action>) => {
	getState(): ReturnType<Reducer<State, Action>>;
	dispatch(action: Action): void;
};

export type Reducer<State, Action> = (state: State, action: Action) => State;
