import { ModelInit, MutableModel } from '../types';

export declare class Setting {
	public readonly id: string;
	public readonly key: string;
	public readonly value: string;

	constructor(init: ModelInit<Setting>);

	static copyOf(
		src: Setting,
		mutator: (draft: MutableModel<Setting>) => void | Setting
	): Setting;
}
