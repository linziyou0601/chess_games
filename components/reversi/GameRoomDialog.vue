<template>
  <div>
    <!-- Modal主題 -->
    <b-modal
      v-model="show"
      hide-header
      hide-footer
      centered
      size="xl"
      :no-close-on-backdrop="true"
    >
      <b-row>
        <b-col cols="12" lg="6" class="text-center py-3">
          <b-row class="px-3">
            <b-col cols="12" class="mb-4">
              <h5 v-if="gameRoomData.turn!==-1" :class="{ self_socket_id: isMyTurn, 'fw-900': true }">
                輪到&emsp;{{ gameRoomData.turn===1? '黑': '白' }}棋 
              </h5>
              <h5 v-else class="fw-900">
                贏家&emsp;{{ winner }}
              </h5>
            </b-col>

            <b-col cols="12" class="mb-4 px-0 px-sm-3">
              <table class="mx-auto">
                <tr>
                  <td v-for="hIndex in ['', '1', '2', '3', '4', '5', '6', '7', '8']" :key="hIndex" class="board_index">{{ hIndex }}</td>
                </tr>
                <tr v-for="(row, i) in gameRoomData.board" :key="i" class='board_row'>
                  <td class="p-0 p-sm-1 board_index">{{ ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][i] }}</td>
                  <td 
                    v-for="(cell, j) in gameRoomData.board[i]" 
                    :key="j" 
                    :class="{prev_chess: i===gameRoomData.prevI && j===gameRoomData.prevJ, cell: true, 'p-0': true, 'p-sm-1': true}" 
                    @click="putChess(i,j)"
                  >
                    <b-img v-if="cell!==0" :src="`${cell===1? 'black': 'white'}_chess.png`" fluid/>
                    <b-img v-else-if="gameRoomData.available[i][j]===1 && isMyTurn" src="available_chess.png" fluid/>
                    <b-img v-else src="empty_chess.png" fluid/>
                  </td>
                </tr>
              </table>
            </b-col>
          </b-row>
        </b-col>

        <b-col cols="12" lg="6" class="py-3">
          <b-row class="px-3">
            <b-col cols="12" class="mb-4">
              <h5 class="fw-900">房間資訊</h5>
            </b-col>

            <b-col cols="12" class="mb-4">
              <b-row>
                <b-col 
                  v-for="(key, ind) in ['black', 'white']"
                  :key="ind"
                  cols="6"
                >
                  <div :class="{ panel: true, 'p-3': true, itsTurn: gameRoomData.turn===(ind+1) }">
                    <h5 :class="{ self_socket_id: gameRoomData[key]===$parent.socketId, 'text-truncate': true, 'subTitle': true }">
                      {{ userNameMap[gameRoomData[key]] || gameRoomData[key] }}
                    </h5>
                    <div>
                      {{ key==='black'? '黑棋': '白棋' }}：{{ gameRoomData[`${key}Total`] }}
                    </div>
                  </div>
                </b-col>
              </b-row>
            </b-col>

            <b-col cols="12" class="mb-4">
              <div class="panel p-3">
                <div>狀&emsp;態：{{ gameRoomData.status }}</div>
                <div v-if="gameRoomData.prevI!==-1 && gameRoomData.prevJ!==-1">上一子：{{ prevChessInfo }}</div>
                <div v-if="gameRoomData.turn===-1">贏&emsp;家：{{ winner }}</div>
              </div>
            </b-col>
          </b-row>
          
          <b-row class="px-3">
            <b-col cols="12">
              <div class="panel p-3">
                <b-button v-if="gameRoomData.turn===-1" class="mx-2 my-1 fw-700" size="lg" @click="again">
                  <fa :icon="['fas', 'mitten']" />&nbsp;新局
                </b-button>
                <b-button v-if="gameRoomData.turn!==-1" class="mx-2 my-1 fw-700" size="lg" @click="surrender">
                  <fa :icon="['fas', 'heart-broken']" />&nbsp;投降
                </b-button>
                <b-button class="mx-2 my-1 fw-700" size="lg" @click="leaveRoom">
                  <fa :icon="['fas', 'sign-out-alt']" />&nbsp;離開
                </b-button>
              </div>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
const namespace = 'reversi'
export default {
  computed: {
    ...mapGetters(namespace, ['userNameMap', 'gameRoomDialogShow', 'gameRoomData']),
    show: {
      get() {
        return this.gameRoomDialogShow
      },
      set(_) {
        this.gameRoomDialogResolved()
      },
    },
    isMyTurn() {
      const ret = (this.gameRoomData.black===this.$parent.socketId && this.gameRoomData.turn===1)
               || (this.gameRoomData.white===this.$parent.socketId && this.gameRoomData.turn===2)
      return ret
    },
    winner() {
      if (this.gameRoomData.winner === -1) return '比賽未結束'
      else if (this.gameRoomData.winner === 0) return '平手'
      else if (this.gameRoomData.winner === 1) return '黑棋'
      else return '白棋'
    },
    prevChessInfo() {
      const hIndex =  ['1', '2', '3', '4', '5', '6', '7', '8'];
      const vIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      return `${vIndex[this.gameRoomData.prevI]}${hIndex[this.gameRoomData.prevJ]}`
    }
  },
  watch: {
    show(newValue, oldValue) {
      if (newValue===true) {
        const audio = new Audio('startGame.wav')
        const startPlayPromise = audio.play()
        if (startPlayPromise !== undefined) {
          startPlayPromise.catch(error => { console.log(error.name) })
        }
      }
    }
  },
  methods: {
    ...mapMutations(namespace, ['gameRoomDialogResolved']),
    putChess(i,j) {
      if (this.isMyTurn && this.gameRoomData.available[i][j]===1) {
        const params = { i, j, roomId: this.gameRoomData.id }
        this.$parent.putChess(params)
      }
    },
    leaveRoom() {
      this.$parent.leaveRoom(this.gameRoomData.id)
    },
    surrender() {
      this.$parent.surrender(this.gameRoomData.id)
    },
    again() {
      this.$parent.again(this.gameRoomData.id)
    }
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
  background: #fffef9;
}

.panel {
  color: #333;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
  background: #ebe5de;
}
.panel.itsTurn {
  color: #EFEFEF;
  background: #3d3a33;
}
.panel.itsTurn .self_socket_id {
  font-weight: 700 !important;
  color: #f7d4a5 !important;
}
.panel button {
  background: #3d3a33;
  border: none;
}

table {
  border-collapse: separate;
  border-spacing: 5px;
  border-radius: 10px;
  background: #948a7b;
  width: auto;
}
td.cell {
  border-radius: 5px;
  color: #FFF;
  background: #d6ccbd;
}
td.cell.prev_chess {
  background: #e4c685;
}
.board_index {
  color: #d6ccbd;
}
@media (max-width: 480px) { 
  .board_index {
    font-size: 5pt;
  }
}
</style>