export const responseHandler = (success: boolean, data: any) => {
	if (!success) {
		const { status, error } = data.response;
		return {
			success,
			statusCode: status,
			message: error
		}
	}

	return { success, data };
}