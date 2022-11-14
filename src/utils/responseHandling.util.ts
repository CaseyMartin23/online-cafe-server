
export type ResponseHandlerType = {
	success: boolean;
	data?: any,
	error?: {
		statusCode: number;
		message: any;
	}	
}

export const responseHandler = (success: boolean, data?: any): ResponseHandlerType => {
	let response = { success };

	if (!success) {
		const { status, error } = data.response;
		return {
			...response,
			error: {
				statusCode: status,
				message: error
			}
		}
	}

	return data ? { ...response, data } : response;
}