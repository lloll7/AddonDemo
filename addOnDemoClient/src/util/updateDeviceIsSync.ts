import api from "@/api";
import { useBridgeDeviceSerialNumberStore } from "@/store/bridgeDeviceList";
import { useDeviceListStore } from "@/store/deviceList";
export const updateDeviceIsSync = async () => {
  const bridgeDeviceListStore = useBridgeDeviceSerialNumberStore();
  const deviceListStore = useDeviceListStore();
  const bridgeDeviceSerialNumberList = await api.bridge.getBridgeDeviceSerialNumber();
  bridgeDeviceListStore.setDeviceSerialNumber(bridgeDeviceSerialNumberList);
  const deviceList = deviceListStore.getDeviceList();
  deviceList.forEach((item) => {
    item.isSynced = false;
    bridgeDeviceSerialNumberList.forEach((bridgeItem) => {
      if (bridgeItem.third_serial_number === item.deviceId) {
        item.isSynced = true;
      }
    });
  });
  deviceListStore.setDeviceList(deviceList);
};
