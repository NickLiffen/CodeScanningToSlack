import { cidrSubnet } from 'ip';

const findIP = (keys: string[], ipToCheck: string) => {
    return keys.some((element) => { return cidrSubnet(element).contains(ipToCheck); } )
};

  export const checkIPs = async (meta: hookIPAddress, ipFromRequest: string): Promise<boolean> => {

    let ipToCheck;

    const keys = Object.values(meta) as string[];

    if (ipFromRequest === 'test-invoke-source-ip') {
      ipToCheck = '40.224.81.5';
    } else {
      ipToCheck = ipFromRequest;
    }

    console.log('keys', keys);
    console.log('ipToCheck', ipToCheck);

    try {
      const response = await findIP(keys, ipToCheck);
      return response;
    } catch (err) {
      console.error('Error Calling Function (findIP)', err);
      throw err;
    }
  };