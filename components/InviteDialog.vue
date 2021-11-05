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
      <b-row>
        <b-col class="text-center py-5">
          <div>
            <fa :icon="['fas', 'mitten']" class="dialog-icon mb-4" />
          </div>
          <h4 class="mt-2 mb-3 fw-900">對戰邀請</h4>
          <div class="mt-2 mb-3">玩家{{ userNameMap[inviteDialog.inviter] || inviteDialog.inviter }}發起對戰</div>
          <b-button class="reject-btn mt-3" @click="reply(false)">不要</b-button>
          &emsp;
          <b-button class="accept-btn mt-3" @click="reply(true)">好哇</b-button>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapGetters(['userNameMap', 'inviteDialog']),
    show: {
      get() {
        return this.inviteDialog.show
      },
      set(_) {
        this.inviteDialogResolved()
      },
    },
  },
  methods: {
    ...mapMutations(['inviteDialogResolved']),
    reply(answer) {
      const params = { inviter: this.inviteDialog.inviter, answer }
      this.$parent.replyInvitation(params, this.inviteDialogResolved);
    },
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

.reject-btn {
  background: #928e85;
  border: none;
}

.accept-btn {
  background: #3d3a33;
  border: none;
}
</style>