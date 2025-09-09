<template>
  <div
    class="device-container"
    :class="{ offine: device && device.isOnline === false }"
  >
    <div class="device-info">
      <div class="device-info-content">
        <div class="logo">
          <img :src="TRVZBLogo" alt="" width="46" height="46" />
        </div>
        <div class="info">
          <div class="device-name">
            {{ device.deviceName }}
          </div>
          <div class="device-id">
            {{ device.deviceId }}
          </div>
        </div>
      </div>
      <div class="device-category-logo">
        <img
          :src="device.isOnline ? onlineLogo : offlineLogo"
          alt=""
          width="24"
          height="24"
        />
      </div>
    </div>
    <div class="device-status">
      <div class="device-fmaily">
        {{ device.familyName }}
      </div>
      <div class="device sync">
        <a-button
          @click.stop="asyncDevice(device.deviceId, device.isSynced)"
          type="link"
          :danger="device.isSynced"
          :block="!device.isSynced"
        >
          {{ device.isSynced ? "Unsync" : "sync" }}
        </a-button>
      </div>
    </div>
    <!-- <a-modal
      wrapClassName="controlThingModal"
      :open="controlThing"
      title="设备控制"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :maskClosable="false"
      :footer="null"
    >
      <div
        class="params-item"
        v-if="deviceParams"
        v-for="(item, key) in deviceParams"
        :key="key"
      >
        <span>{{ EThingParams[`${key}`] }}</span>
        <a-radio-group
          v-if="key === 'workMode'"
          v-model:value="deviceParams[key]"
          @change="handleSubmit(key)"
        >
          <a-radio-button value="0">手动模式</a-radio-button>
          <a-radio-button value="1">关闭（防霜冻）</a-radio-button>
          <a-radio-button value="2">自动模式</a-radio-button>
        </a-radio-group>
        <a-switch
          v-if="key === 'childLock'"
          v-model:checked="deviceParams[key]"
          size="small"
          @change="handleSubmit(key)"
        />
      </div>
      <a-button @click="handleCancel" class="btn">关闭</a-button>
    </a-modal> -->
  </div>
</template>

<script setup lang="ts">
import type { IThing, IThingParams } from "@/ts/interface/IThing";
// import EThingParams from "@/ts/enum/EThingParams";
import TRVZBLogo from "@/assets/img/TRVZB.png";
import onlineLogo from "@/assets/img/wifi.png";
import offlineLogo from "@/assets/img/offline.png";
import { defineEmits, ref, onMounted, watch } from "vue";
import { useBridgeStore } from "@/store/bridge";
import { message } from "ant-design-vue";
import { updateDeviceIsSync } from "@/util/updateDeviceIsSync";
import { useBridgeDeviceSerialNumberStore } from "@/store/bridgeDeviceSerialNumber";
import api from "@/api";
const props = defineProps<{
  device: IThing;
  controlThing: boolean;
}>();
const deviceParams = ref<IThingParams | null>(null);
const bridgeStore = useBridgeStore();
const bridgeDeviceSerialNumberStore = useBridgeDeviceSerialNumberStore();
const emit = defineEmits(["changeModalStatus", "changeDeviceStatus"]);
// 提交设备控制
// const handleSubmit = async (param: string) => {
//   let data;
//   switch (param) {
//     case "childLock":
//       data = {
//         childLock: deviceParams.value?.childLock,
//       };
//       break;
//     case "workMode":
//       data = {
//         workMode: deviceParams.value?.workMode,
//       };
//       break;
//   }
//   emit("changeDeviceStatus", data);
// };

// 同步设备
const asyncDevice = async (deviceid: string, isSynced: boolean) => {
  // 先判断是否存有网关访问凭证
  const bridgeAt = bridgeStore.getBridgeAt();
  if (!bridgeAt) {
    await getBridgeTokenFn();
    return;
  }
  // 如果有则同步设备
  // 判断是同步还是取消同步
  if (isSynced) {
    await unAsyncDeviceFn(deviceid); // 取消同步
  } else {
    await asyncDeviceFn(deviceid); // 同步设备
  }
};
// 获取网关访问凭证
const getBridgeTokenFn = async () => {
  try {
    // 如果没有则调用获取网关访问凭证的接口
    const res = await api.bridge.getBridgeToken();
    if (res.error === 401) {
      message.warn("请到对应网关端按压指定键");
      return;
    } else {
      // 存入网关访问凭证
      bridgeStore.setBridgeAt(res.data.token);
      message.success("获取网关访问凭证成功");
      await updateDeviceIsSync(); // 更新设备同步状态
    }
  } catch (error) {
    console.log(error);
  }
};
// 同步对应设备
const asyncDeviceFn = async (deviceid: string) => {
  try {
    // 同步
    const res = await api.bridge.syncDevice(deviceid);
    if (res.header && res.header.name === "Response") {
      message.success("同步成功");
      await updateDeviceIsSync(); // 更新设备同步状态
    } else {
      message.error("同步失败");
    }
  } catch (error) {
    console.log(error);
  }
};
// 取消同步
const unAsyncDeviceFn = async (deviceid: string) => {
  try {
    const serNumList = bridgeDeviceSerialNumberStore.getDeviceSerialNumber();
    let devSerNum = "";
    serNumList.forEach((item) => {
      if (item.third_serial_number === deviceid) {
        devSerNum = item.serial_number;
        return;
      }
    });
    if (!devSerNum) return;
    const res = await api.bridge.delDevice(devSerNum);
    if (res.error === 0) {
      message.success("取消同步成功");
      await updateDeviceIsSync(); // 更新设备同步状态
    }
  } catch (error) {
    console.log(error);
  }
};

// const handleCancel = () => {
//   emit("changeModalStatus", false);
// };

onMounted(() => {
  const params = JSON.parse(JSON.stringify(props.device.params));
  deviceParams.value = {
    childLock: params.childLock,
    workMode: params.workMode,
  };
});
// 监听设备的设备信息更新
watch(
  () => props.device.params,
  () => {
    const params = JSON.parse(JSON.stringify(props.device.params));
    deviceParams.value = {
      childLock: params.childLock,
      workMode: params.workMode,
    };
  },
  { deep: true },
);
// 监听设备上下线
watch(
  () => props.device.isOnline,
  (newVal) => {
    if (!newVal) {
      emit("changeModalStatus", false);
    }
  },
  { deep: true },
);
</script>

<style>
.controlThingModal {
  .ant-modal-body {
    display: flex;
    align-items: center;
    flex-direction: column;
    box-shadow: 0 0 4px #b9b4b440;
    padding: 15px;
    border-radius: 5px;
    .params-item {
      width: 100%;
      height: 32px;
      line-height: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .btn {
      width: 20%;
      margin-top: 15px;
    }
  }
}
</style>
<style scoped lang="scss">
.device-container {
  @include flex(center, center, column);
  width: 300px;
  height: 100px;
  padding: 16px;
  box-shadow: 0 0 4px #b9b4b440;
  border-radius: 12px;
  margin: 20px 20px 0px 0px;
  .device-info {
    @include flex(space-between, center);
    width: 100%;
    .device-info-content {
      @include flex(space-between, center);
      .info {
        .device-name {
          font-size: 18px;
          font-weight: 600;
          max-width: 250px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .device-id {
          font-size: 14px;
          color: #a1a1a1;
        }
      }
    }
  }
  .device-status {
    @include flex(space-between, center);
    width: 100%;
    padding-left: 46px;
    .device-fmaily {
      font-weight: 600;
      color: #a1a1a1;
      font-size: 14px;
    }
  }
}
.device-container.offine {
  background-color: #e7e8ec;
  .logo {
    filter: grayscale(100%);
    opacity: 0.5;
  }
  .info {
    .device-name {
      color: #888888;
    }
    .device-id {
      color: #a8a1b2;
    }
  }
}
</style>
