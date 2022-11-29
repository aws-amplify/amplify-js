// keeping this so that jest does not complain
test('should do nothing', () => {});

// device tracking mock device data
export const mockDeviceArray = [
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623956729.32,
		DeviceKey: 'us-east-2_596db07d-793a-4070-8140-27f321ccf01c',
		DeviceLastAuthenticatedDate: 1623956729,
		DeviceLastModifiedDate: 1623956730.312,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623956945.271,
		DeviceKey: 'us-east-2_12ac778f-52a4-4fca-a628-237776159c91',
		DeviceLastAuthenticatedDate: 1623956945,
		DeviceLastModifiedDate: 1623956945.904,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623957888.742,
		DeviceKey: 'us-east-2_4a93aeb3-01af-42d8-891d-ee8aa1549398',
		DeviceLastAuthenticatedDate: 1623963456,
		DeviceLastModifiedDate: 1623963457.705,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623957198.984,
		DeviceKey: 'us-east-2_e0019223-e6b8-453f-a4e7-4e0d69dd4316',
		DeviceLastAuthenticatedDate: 1623957198,
		DeviceLastModifiedDate: 1623957199.861,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623954284.74,
		DeviceKey: 'us-east-2_1763f940-7136-4133-8cf5-eb073cad06c9',
		DeviceLastAuthenticatedDate: 1623954284,
		DeviceLastModifiedDate: 1623954285.339,
	},
	{
		DeviceAttributes: [
			{
				Name: 'device_status',
				Value: 'valid',
			},
			{
				Name: 'device_name',
				Value: 'react-native',
			},
			{
				Name: 'last_ip_used',
				Value: '45.17.45.126',
			},
		],
		DeviceCreateDate: 1623954284.75,
		DeviceKey: 'us-west-2_80ede80b-f333-49cd-af42-0ad22d8de9d4',
		DeviceLastAuthenticatedDate: 1623954285,
		DeviceLastModifiedDate: 1623954285.34,
	},
];

export const transformedMockData = [
	{
		id: 'us-east-2_596db07d-793a-4070-8140-27f321ccf01c',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	},
	{
		id: 'us-east-2_12ac778f-52a4-4fca-a628-237776159c91',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	},
	{
		id: 'us-east-2_4a93aeb3-01af-42d8-891d-ee8aa1549398',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36',
	},
	{
		id: 'us-east-2_e0019223-e6b8-453f-a4e7-4e0d69dd4316',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	},
	{
		id: 'us-east-2_1763f940-7136-4133-8cf5-eb073cad06c9',
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
	},
	{
		id: 'us-west-2_80ede80b-f333-49cd-af42-0ad22d8de9d4',
		name: 'react-native',
	},
];
