
export type ResponseHandlerType = {
	success: boolean;
	data?: any,
	error?: {
		statusCode: number;
		message: any;
	}
}

const INVALID_OBJECTID_REASON = 'BSONTypeError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer';

export const responseHandler = (success: boolean, data?: any): ResponseHandlerType => {
	let response = { success };

	if (!success) {
		if (data.reason) {
      const reason = new Error(data.reason);
      return {
				...response,
				error: {
					statusCode: 406,
					message: reason.message == INVALID_OBJECTID_REASON ? "Invalid ID recieved" : reason.message 
				}
			}
		} else {
			const { status, error } = data.response;
			return {
				...response,
				error: {
					statusCode: status,
					message: error
				}
			}
		}
	}

	return data ? { ...response, data } : response;
}