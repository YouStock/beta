export class Utils {
    static address(address: string, without0x?: boolean) : string {
        if(address.startsWith('0x')) {
            if(without0x)
                return address.substr(2);
        }
        else if (!without0x)
            return '0x' + address;
        return address;
        }

    static zeroX(address: string): string {
        return Utils.address(address, false);
    }

    static trim0x(address: string): string {
        return Utils.address(address, true);
    }
}
