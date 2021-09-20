import { Predicate } from '../src/predicates/next';
// import { getModelDefinition } from '../src/datastore/datastore';
import { Model, Metadata, testSchema } from './helpers';
import {
	NonModelTypeConstructor,
	PersistentModel,
	PersistentModelConstructor,
} from '../src/types';
import {
	Author,
	Post,
	Comment,
	Blog,
	BlogOwner,
	PostAuthorJoin,
	Person,
	PostMetadata,
	Nested,
} from './model';

describe('Predicates', () => {
	describe('as filters', () => {
		const flatAuthorsArray = [
			'Adam West',
			'Bob Jones',
			'Clarice Starling',
			'Debbie Donut',
			'Zelda from the Legend of Zelda',
		].map(name => new Author({ name }));

		// const authorDefinition = testSchema().models[Author.name];
		// authorDefinition.fields.name.association.targetName;

		test('find matches on eq', async () => {
			const query = Predicate.for(Author).name.eq('Adam West');
			const matches = await query.filter(flatAuthorsArray);

			expect(matches.length).toBe(1);
			expect(matches[0].name).toBe('Adam West');
		});

		test('find no false matches on eq', () => {});

		test('find matches on gt', () => {});
	});

	describe('as nested filters', () => {
		// implement some tests!
	});
});
