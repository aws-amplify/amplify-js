/**
 *
 *
 * HIGHLY EXPERIMENTAL STUFF BELOW.
 *
 *
 */

/**
 *
 * Repository Pattern-ish stuff.
 *
 */

/**
 * Gets a single page of items, omitting "empty" items.
 *
 * @param nextToken The pagination token provided by the API.
 * @returns The list of items.
 */
export async function getPage<T extends Fields>(
	shape: Shape<T>,
	nextToken: string | null | undefined,
	filter: any, // TODO: type based on Shape
	context: Context = { Auth, API }
): Promise<PageOf<T>> {
	const variables = { nextToken } as any;
	if (filter) variables.filter = filter;

	const page = await context.API.graphql({
		query: `
      query List${shape.name} (
        $filter: Model${shape.name}FilterInput
        $limit: Int
        $nextToken: String
      ) {
        list${
					shape.name
				}(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
          ${Object.keys(shape.fields).join('\n')}
        }
        nextToken
      }
    }`,
		variables: {
			nextToken,
		},
	});

	const result = {
		items: (page.data?.[`list${shape.name}`]?.items.filter((i: any) => i) ||
			[]) as ModelOf<Shape<T>>[],
		nextToken: page.data?.[`list${shape.name}`]?.nextToken,
	};

	return result;
}

/**
 * Handling pagination is actually one of the more annoying issues when
 * dealing with cloud services, generally speaking. While most customers
 * will never be bitten by pagination concerns, those who *would* be
 * impacted really just shouldn't have to worry about it.
 */
export async function* allPages<T extends Fields>(
	shape: Shape<T>,
	filter: any, // TODO: type based on Shape
	context: Context = { Auth, API }
): AsyncGenerator<ModelOfFields<T>[], void, unknown> {
	let items: ModelOfFields<T>[] | undefined;
	let nextToken: string | null | undefined = undefined;

	while (true) {
		({ items, nextToken } = await getPage(context, shape, nextToken, filter));
		yield items;
		if (!nextToken) break;
	}
}

/**
 * Gets ALL items, omitting "empty" values and handling pagination transparently.
 *
 * @returns The list of ALL items.
 */
export async function getAll<T extends Fields>(
	shape: Shape<T>,
	filter: any, // TODO: type based on Shape
	context: Context = { Auth, API }
) {
	let items: ModelOfFields<T>[] = [];
	for await (const page of allPages(context, shape, filter)) {
		items = [...items, ...page];
	}
	return items;
}

/**
 * Concurrently begin deleting all threads.
 *
 * @param context
 */
export async function deleteAll<T extends Fields>(
	shape: Shape<T>,
	filter: any,
	context: Context = { Auth, API }
) {
	const deletions = [];
	for (const item of await getAll(context, shape, filter)) {
		deletions.push(
			context.API.graphql({
				query: ``,
				variables: {
					input: {
						// TODO: CPK.
						id: (item as any).id,
					},
				},
			})
		);
	}
	return Promise.all(deletions);
}

/**
 *
 * Dynamic.
 *
 */

export function typedGet() {}

export function typedList() {}

export function typedCreate() {}

export function typedUpdate() {}

export function typedDelete() {}

/**
 *
 * LIVE COLLECTIONS
 *
 */

type SubscriptionOf<T extends Shape<any>> = Observable<ModelOp<ModelOf<T>>>;

function typedSubscribe<T extends Fields>(
	shape: Shape<T>,
	op: ObservableOperation,
	filter: any, // TODO: type based on Shape
	context: Context = { Auth, API }
): Observable<ModelOf<Shape<T>>> {
	return (
		context.API.graphql({
			query: `On${op}${shape.name} (
        $filter: ModelSubscription${shape.name}FilterInput
        $owner: String
       ) {
        on${op}${shape.name}(filter: $filter, owner: $owner) {
          ${Object.keys(shape.fields).join('\n')}
        }
       }`,
			variables: {
				filter,
			},
		}) as Observable<any>
	).map(({ provider, value }: any) => value?.data?.[`on${op}${shape.name}`]);
}

export function typedObserve<T extends Fields>(
	shape: Shape<T>,
	filter: any, // TODO: type based on Shape?
	context: Context = { Auth, API }
): SubscriptionOf<Shape<T>> {
	return new Observable(observer => {
		const subs = [
			ObservableOperation.Create,
			ObservableOperation.Update,
			ObservableOperation.Delete,
		].map(op =>
			typedSubscribe(shape, op, filter, context).subscribe({
				next(value) {
					observer.next({ op, value });
				},
			})
		);

		return () => subs.forEach(sub => sub.unsubscribe());
	});
}

/**
 * Sample observeQuery type of call. Naive implementation.
 *
 * @param context
 * @param filter
 */
export function liveCollection<T extends Fields>(
	shape: Shape<T>,
	filter: any,
	context: Context = { Auth, API }
): Observable<ModelOfFields<T>[]> {
	return new Observable(observer => {
		const updates: ModelOp<ModelOfFields<T>>[] = [];
		let results: ModelOfFields<T>[] = [];
		let initialResultsPopulated = false;

		const ingestOperation = (op: ModelOp<ModelOfFields<T>>) => {
			switch (op.op) {
				case ObservableOperation.Create:
					results.push(op.value);
					break;
				case ObservableOperation.Update:
					results = results.map(existing =>
						existing.id === op.value.id ? op.value : existing
					);
					break;
				case ObservableOperation.Delete:
					results = results.filter(existing =>
						existing.id === op.value.id ? false : true
					);
					break;
			}
		};

		const notifyObserver = () => {
			observer.next(results);
		};

		const sub = typedObserve(shape, filter, context).subscribe({
			next: ({ op, value }) => {
				if (initialResultsPopulated) {
					ingestOperation({ op, value });
					notifyObserver();
				} else {
					updates.push({ op, value });
				}
			},
		});

		getAll(context, shape, filter).then(items => {
			results.push(...items);
			initialResultsPopulated = true;
			for (const update of updates) {
				ingestOperation(update);
			}
			notifyObserver();
		});

		return () => sub.unsubscribe();
	});
}
