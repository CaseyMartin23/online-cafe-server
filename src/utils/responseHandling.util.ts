
export type ResponseHandlerType = {
	success: boolean;
	data?: any,
	error?: {
		statusCode: number;
		message: any;
	}
}

const INVALID_OBJECTID_REASON = 'BSONTypeError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer';

const handleInvalidObjectIdErrorResponses = (data: any, response: any) => {
	const reason = new Error(data.reason);
	return {
		...response,
		error: {
			statusCode: 406,
			message: reason.message == INVALID_OBJECTID_REASON ? "Invalid ID recieved" : reason.message
		}
	};
}

const handleErrorResponses = (data: any, response: any) => {
	if (data.reason) {
		handleInvalidObjectIdErrorResponses(data, response);
	} else if (data.response.data) {
		const { status } = data.response;
		const { code, message, field_errors } = data.response.data;
		const { field, error } = field_errors[0];

		return {
			...response,
			error: {
				statusCode: status,
				message: `Code: ${code}, ${message}, field: ${field}, ${error}`
			}
		};
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

export const responseHandler = (success: boolean, data?: any): ResponseHandlerType => {
	let response = { success };
	if (!success) {
		return handleErrorResponses(data, response);
	}
	return data ? { ...response, data } : response;
}