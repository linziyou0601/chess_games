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
              <fa :icon="['fas', 'chess-board']" class="dialog-icon mb-4" />
            </div>
            <h4 class="mt-2 mb-3 fw-900">{{ title }}</h4>
            <div class="mt-2 mb-3">{{ msg }}</div>
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
    ...mapGetters(namespace, ['gameEndDialog']),
    show: {
      get() {
        return this.gameEndDialog.show
      },
      set(_) {
        this.gameEndDialogResolved()
      },
    },
    title() {
      if (this.gameEndDialog.winner==='') return '平手'
      else if (this.gameEndDialog.winner===this.$parent.socketId) return '你贏了'
      else return '你輸了'
    },
    msg() {
      if (this.gameEndDialog.surrendered && this.gameEndDialog.winner===this.$parent.socketId)
        return '對手投降'
      else
        return ''
    }
  },
  methods: {
    ...mapMutations(namespace, ['gameEndDialogResolved']),
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