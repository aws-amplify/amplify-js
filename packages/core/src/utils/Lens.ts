// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type Getter<W, P> = (w: W) => P;
type Setter<W, P> = (p: P) => (w: W) => W;

export class Lens<W, P> {
	private readonly get: Getter<W, P>;

	/** @internal */
	readonly set: Setter<W, P>;

	static of<T>(): Lens<T, T> {
		return new Lens<T, T>(
			t => t,
			t => () => t
		);
	}

	constructor(get: Getter<W, P>, set: Setter<W, P>) {
		this.get = get;
		this.set = set;
	}

	private compose<Q>(next: Lens<P, Q>): Lens<W, Q> {
		return new Lens<W, Q>(
			w => next.get(this.get(w)),
			q => w => this.set(next.set(q)(this.get(w)))(w)
		);
	}

	atKey<Q extends keyof P>(key: Q): Lens<W, P[Q]> {
		return this.compose(
			new Lens<P, P[Q]>(
				p => p[key],
				pq => p => ({
					...p,
					[key]: pq,
				})
			)
		);
	}
}
