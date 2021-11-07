<template>
  <div>
    <!-- Modal主題 -->
    <b-modal
      v-model="show"
      hide-header
      hide-footer
      centered
      :no-close-on-backdrop="true"
    >
      <template #default="{ ok }">
         <b-row>
          <b-col class="text-center py-5">
            <div>
              <fa :icon="['fas', 'info-circle']" class="dialog-icon mb-4" />
            </div>
            <h4 class="mt-2 mb-3 fw-900">遊戲結束</h4>
            <div class="mt-2 mb-3">使用者離開遊戲房間</div>
            <b-button variant="dark" class="mt-3" @click="ok()">確定</b-button>
          </b-col>
        </b-row>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
const namespace = 'reversi'
export default {
  computed: {
    ...mapGetters(namespace, ['leaveRoomDialogShow']),
    show: {
      get() {
        return this.leaveRoomDialogShow
      },
      set(_) {
        this.hideLeaveRoomDialog()
      },
    },
  },
  methods: {
    ...mapMutations(namespace, ['hideLeaveRoomDialog']),
  },
}
</script>

<style scoped>
>>> .modal-content, >>> .modal-body {
  border-radius: 1rem;
  border: none;
  box-shadow: 1px 1px 20px #666666A6;
  -webkit-box-shadow: 1px 1px 20px #666666A6;
	-moz-box-shadow: 1px 1px 20px #666666A6;
}

/* -------------------- 資料物件 -------------------- */
.dialog-icon {
  font-size: 70px;
  font-weight: 700;
}
</style>