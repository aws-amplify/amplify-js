import { AuthError } from '../error/AuthError';
import { AuthValidationErrorMap } from '../error/types/maps/authValidationErrorMap';

/**
 *  Throws a validation error
 *
 * @param  errorData validation error object
 *
 * @throws
 *  error: {@link AuthError}
 *
 * @example
 *  ```ts
 *  // internal usage
 *  function signIn(req:SignInRequest):SignInResult{
 *
 *      const {username, password} = req
 *
 * // Note: It's recommended to pass the `name` key first to have a better IntelliSense support
 *      if(!username) throwValidationError({
 *         name: "EmptySignInUsername",
 *         message: "Username is required to signIn",
 *         recoverySuggestion: "Make sure that a valid username is passed during sigIn",
 *        })
 *
 *     if(!password) throwValidationError({
 *         name: "EmptySignInPassword",
 *         message: "Password is required to signIn",
 *         recoverySuggestion: "Make sure that a valid password is passed during sigIn",
 *      })
 *   }
 *
 * ```
 */
export function throwValidationError<
	ErrorType extends keyof AuthValidationErrorMap
>(errorData: {
	name: `${ErrorType}`;
	message: AuthValidationErrorMap[ErrorType]['message'];
	recoverySuggestion: AuthValidationErrorMap[ErrorType]['recovery'];
}): never {
	throw new AuthError({
		name: errorData.name,
		message: errorData.message,
		recoverySuggestion: errorData.recoverySuggestion,
	});
}
