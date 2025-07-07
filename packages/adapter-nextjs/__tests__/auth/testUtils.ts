import { NextApiResponse } from 'next';

export const createMockNextApiResponse = () => {
	const mockResponseAppendHeader = jest.fn();
	const mockResponseEnd = jest.fn();
	const mockResponseStatus = jest.fn();
	const mockResponseSend = jest.fn();
	const mockResponseRedirect = jest.fn();
	const mockResponse = {
		appendHeader: mockResponseAppendHeader,
		status: mockResponseStatus,
		send: mockResponseSend,
		redirect: mockResponseRedirect,
		end: mockResponseEnd,
	} as unknown as NextApiResponse;

	mockResponseAppendHeader.mockImplementation(() => mockResponse);
	mockResponseStatus.mockImplementation(() => mockResponse);

	return {
		mockResponseAppendHeader,
		mockResponseEnd,
		mockResponseStatus,
		mockResponseSend,
		mockResponseRedirect,
		mockResponse,
	};
};
