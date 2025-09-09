<template>
  <div>
    <a-modal
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
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import type { IThing, IThingParams } from "@/ts/interface/IThing";
import { onMounted, ref, watch } from "vue";
import EThingParams from "@/ts/enum/EThingParams";

const props = defineProps<{
  device: IThing;
  controlThing: boolean;
}>();

const deviceParams = ref<IThingParams | null>(null);
const emit = defineEmits(["changeModalStatus", "changeDeviceStatus"]);
// 提交设备控制
const handleSubmit = async (param: string) => {
  let data;
  switch (param) {
    case "childLock":
      data = {
        childLock: deviceParams.value?.childLock,
      };
      break;
    case "workMode":
      data = {
        workMode: deviceParams.value?.workMode,
      };
      break;
  }
  emit("changeDeviceStatus", data);
};
// 关闭modal
const handleCancel = () => {
  emit("changeModalStatus", false);
};

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
</script>

<style scoped lang="scss"></style>
