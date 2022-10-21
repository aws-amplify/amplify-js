import { Component, h, Prop, FunctionalComponent } from '@stencil/core';
import { AuthStateHandler } from '../../common/types/auth-types';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';

/**
 * @slot logo - Left-justified content placed at the start of the greetings bar
 * @slot nav - Right-justified content placed at the end of the greetings bar
 * @slot greetings-message - Content placed in the greetings text
 */
@Component({
	tag: 'amplify-greetings',
	styleUrl: 'amplify-greetings.scss',
	shadow: true,
})
export class AmplifyGreetings {
	/** Username displayed in the greetings */
	@Prop() username: string = null;
	/** Logo displayed inside of the header */
	@Prop() logo: FunctionalComponent | null = null;
	/** Auth state change handler for this component */
	@Prop()
	handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;

	render() {
		return (
			<header class="greetings">
				<span class="logo">
					<slot name="logo">{this.logo && <span>{this.logo}</span>}</slot>
				</span>
				<span class="nav">
					<slot name="nav">
						<amplify-nav>
							{this.username && (
								<slot name="greetings-message">
									<span>Hello, {this.username}</span>
								</slot>
							)}
							<amplify-sign-out
								handleAuthStateChange={this.handleAuthStateChange}
							/>
						</amplify-nav>
					</slot>
				</span>
			</header>
		);
	}
}
