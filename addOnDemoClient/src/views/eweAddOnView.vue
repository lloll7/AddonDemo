<template>
  <div class="eweAddOn-wrapper">
    <div class="login-container">
      <div class="app-info-container">
        <div class="logo-container">
          <img :src="logo" alt="" width="50" height="50" />
        </div>
        <div class="title-and-description">
          <div class="title-and-status">
            <span class="title">eWeLink Smart Home</span>
            <a-tag class="status" :color="etcStore.at ? 'green' : 'red'">{{
              etcStore.at ? "进行中" : "未登录"
            }}</a-tag>
          </div>
          <span class="description">Control eWeLink's LAN devices in eWeLink CUBE</span>
        </div>
      </div>
      <div class="login-btn">
        <a-button v-if="!etcStore.at" @click="handleLoginClick">登录</a-button>
        <a-button v-else @click="handleLoginOutClick">退出登录</a-button>
        <a-modal
          v-model:open="infoInputModalStatus"
          title="登录"
          :confirm-loading="confirmLoading"
          ok-text="确认"
          cancel-text="取消"
          @ok="handleSubmit"
        >
          <a-form
            :model="formState"
            name="basic"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 16 }"
            autocomplete="off"
          >
            <a-form-item label="国家区号" name="countryCode">
              <a-select v-model:value="formState.countryCode">
                <a-select-option
                  v-for="item in AreaCodes"
                  :key="`${item.value}-${item.label}`"
                  :value="item.value"
                  >{{ `${item.value}: ${item.label}` }}</a-select-option
                >
              </a-select>
            </a-form-item>
            <a-form-item
              label="邮箱/手机号"
              name="username"
              :rules="[{ required: true, message: '请输入你的邮箱或手机号' }]"
            >
              <a-input v-model:value="formState.username" />
            </a-form-item>

            <a-form-item
              label="密码"
              name="password"
              :rules="[{ required: true, message: '请输入密码' }]"
            >
              <a-input-password v-model:value="formState.password" />
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    </div>
    <div class="device-list">
      <deviceItem
        v-if="deviceListStore.deviceList"
        v-for="item in deviceListStore.deviceList"
        :key="item.deviceId"
        :device="item"
        :controlThing="controlThingBool"
        @click="item.isOnline && changeModalStatus(true)"
        @changeModalStatus="changeModalStatus"
        @changeDeviceStatus="(data) => changeDeviceStatus(data, item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/img/eWeLink-smart-home.logo.png";
import { AreaCodes } from "@/util/countryList";
import { ref, onMounted, onBeforeMount } from "vue";
import { type ILoginInfo } from "@/ts/interface/IUser";
import type { IThing, IThingParams } from "@/ts/interface/IThing";
import api from "@/api";
import { useEtcStore } from "@/store/etc";
import { useBridgeStore } from "@/store/bridge";
import { useDeviceListStore } from "@/store/deviceList";
import { message } from "ant-design-vue";
import deviceItem from "@/components/deviceItem.vue";
import { wsClient } from "@/composables/useWebsocket";
import type { DeviceControlMessage } from "@/ts/interface/IWebsocket";
import { updateDeviceIsSync } from "@/util/updateDeviceIsSync";

const etcStore = useEtcStore();
const bridgeStore = useBridgeStore();
const deviceListStore = useDeviceListStore();
const infoInputModalStatus = ref(false);
const confirmLoading = ref(false);
const controlThingBool = ref(false);
const formState = ref({
  countryCode: "",
  username: "",
  password: "",
});
const handleLoginClick = async () => {
  infoInputModalStatus.value = true;
};

// 登录
const handleSubmit = async () => {
  confirmLoading.value = true;
  let loginInfo: ILoginInfo;
  if (formState.value.username.includes("@")) {
    loginInfo = {
      countryCode: formState.value.countryCode,
      email: formState.value.username,
      password: formState.value.password,
    };
  } else {
    loginInfo = {
      countryCode: formState.value.countryCode,
      phoneNumber: formState.value.countryCode + formState.value.username,
      password: formState.value.password,
    };
  }
  const res = await api.user.login(loginInfo);
  if (res.at) {
    message.success("登录成功");
    wsClient.connect();
    etcStore.setToken(res);
    etcStore.initToken();
    deviceListStore.initDeviceList(etcStore.getToken());
    updateDeviceIsSync();
  } else {
    message.success(`登录失败, 原因: ${res.message ? res.message : ""}`);
  }
  clearFormState();
  confirmLoading.value = false;
  infoInputModalStatus.value = false;
};

// 登录modal关闭回调
const clearFormState = () => {
  formState.value = {
    countryCode: "",
    username: "",
    password: "",
  };
};

// 退出登录按钮点击
const handleLoginOutClick = async () => {
  const res = await api.user.loginOut();
  if (res.error === 0) {
    message.success("退出成功");
    wsClient.disconnect(); // 断开ws连接
    etcStore.clearToken(); // 清空token
    deviceListStore.clearDeviceList();
  } else {
    changeDeviceStatus;
    message.error(`${res.msg}`);
  }
  clearFormState();
};

const changeModalStatus = (status: boolean) => {
  controlThingBool.value = status;
};
// 更改设备状态
const changeDeviceStatus = async (newDeviceStatus: IThingParams, currDevice: IThing) => {
  const apikey = etcStore.getApikey();
  if (apikey) {
    const param: DeviceControlMessage = {
      action: "update",
      deviceid: currDevice.deviceId,
      apikey: apikey,
      sequence: JSON.stringify(Date.now()),
      params: newDeviceStatus,
      userAgent: "app",
    };
    wsClient.changeDeviceStatus(param);
  } else {
    message.error("登录失效，请重新登录");
  }
};

/** 暂时去除sse连接, 后续长连接通过websocket进行 */
/** SSE连接部分 */
// let eventSource: EventSource | null = null;
onMounted(async () => {
  //   // 获取sse连接实例
  //   eventSource = new EventSource("http://localhost:3000/sse/stream");
  //   // 监听消息事件
  //   eventSource.onmessage = (event: MessageEvent) => {
  //     const data = JSON.parse(event.data);
  //     console.log(data);
  //   };
  //   eventSource.addEventListener("ping", (e) => {
  //     // 心跳
  //     console.log("ping:", e.data);
  //   });
  //   eventSource.addEventListener("thingList", (e) => {
  //     const payload = JSON.parse(e.data);
  //     console.log("thingList: ", payload);
  //   });
  //   eventSource.onerror = (e) => {
  //     console.warn("sse error", e);
  //   };
  await etcStore.initToken(); // 页面刷新后重新获取token
  await bridgeStore.initBridgeAt();
  if (etcStore.at) {
    await deviceListStore.initDeviceList(etcStore.at); // 如果已登录则获取设备列表
  }
  await updateDeviceIsSync(); // 更新设备同步状态
  wsClient.connect();
});

// onBeforeMount(() => {
//   if (eventSource) {
//     eventSource.close();
//   }
// });
</script>

<style scoped lang="scss">
.eweAddOn-wrapper {
  @include flex(center, center, column);
  width: 80%;
  height: auto;
  padding: 10px 25px;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  .login-container {
    @include flex(space-between, center);
    width: 100%;
    margin-bottom: 10px;
    .app-info-container {
      @include flex(space-between, center);
      .logo-container {
        margin-right: 15px;
      }
      .title-and-description {
        @include flex(space-between, flex-start, column);
        height: 40px;
        .title-and-status {
          @include flex(flex-start, center);
          .title {
            font-size: 16px;
            font-weight: 500;
            color: #424242;
            margin-right: 20px;
          }
          .status {
            font-size: 12px;
            font-weight: 500;
          }
        }
        .description {
          font-size: 14px;
          font-weight: 400;
          color: #a1a1a1;
        }
      }
    }
  }
  .device-list {
    @include flex(flex-start, center);
    flex-wrap: wrap;
    width: 100%;
  }
}
</style>
