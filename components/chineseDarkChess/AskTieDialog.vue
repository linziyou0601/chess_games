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
          <h4 class="mt-2 mb-3 fw-900">求和</h4>
          <div class="mt-2 mb-3">玩家{{ userNameMap[askTieDialog.user] || askTieDialog.user }}求和</div>
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
const namespace = 'chineseDarkChess'
export default {
  computed: {
    ...mapGetters(namespace, ['userNameMap', 'gameRoomData', 'askingTie', 'askTieDialog']),
    show: {
      get() {
        return this.askTieDialog.show && !this.askingTie
      },
      set(_) {
        this.askTieDialogResolved()
      },
    },
  },
  watch: {
    show(newValue, oldValue) {
      if (newValue===true) {
        const audio = new Audio('invitedSound.mp3')
        const startPlayPromise = audio.play()
        if (startPlayPromise !== undefined) {
          startPlayPromise.catch(error => { console.log(error.name) })
        }
      }
    }
  },
  methods: {
    ...mapMutations(namespace, ['askTieDialogResolved']),
    reply(answer) {
      const params = { roomId: this.gameRoomData.id, answer }
      this.$parent.replyAskTie(params, this.askTieDialogResolved);
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