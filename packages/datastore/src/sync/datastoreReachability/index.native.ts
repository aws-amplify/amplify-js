import { Reachability } from '@aws-amplify/core';
import { default as NetInfo } from '@react-native-community/netinfo';

export default new Reachability().networkMonitor(NetInfo);
