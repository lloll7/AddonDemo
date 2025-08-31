<template>
  <div class="device-container">
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
        <img :src="WIFILogo" alt="" width="24" height="24" />
      </div>
    </div>
    <div class="device-status">
      <div class="device-fmaily">
        {{ device.familyName }}
      </div>
      <div class="device sync">
        <a-button type="link" :danger="device.isSynced" :block="!device.isSynced">
          {{ device.isSynced ? "Unsync" : "sync" }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type IThing } from "@/ts/interface/IThing";
import TRVZBLogo from "@/assets/img/TRVZB.png";
import WIFILogo from "@/assets/img/wifi.png";
defineProps<{
  device: IThing;
}>();
</script>

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
</style>
