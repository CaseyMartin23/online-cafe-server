export const responseHandler = (success: boolean, data?: any) => {
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