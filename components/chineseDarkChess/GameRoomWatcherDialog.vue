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
              <h5 v-if="gameRoomData.turn!==-1" class="fw-900">
                輪到&emsp;玩家{{ gameRoomData.turn===1? '1': '2' }}&nbsp;
                {{ 
                  gameRoomData[`user${gameRoomData.turn}Color`]==='b'? 
                    '黑方': gameRoomData[`user${gameRoomData.turn}Color`]==='r'? 
                             '紅方': '顏色未定'  
                }}
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
                <tr v-for="(row, i) in gameRoomData.statusBoard" :key="i" class='board_row'>
                  <td class="p-0 p-sm-1 board_index">{{ ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][i] }}</td>
                  <td 
                    v-for="(cell, j) in gameRoomData.statusBoard[i]" 
                    :key="j" 
                    :class="{prev_chess: i===gameRoomData.prevI && j===gameRoomData.prevJ, cell: true, 'p-0': true, 'p-sm-1': true}" 
                  >
                    <b-img v-if="cell===0" src="close.png" fluid/>
                    <b-img v-else-if="cell===1" :src="`${gameRoomData.chessBoard[i][j]}.png`" fluid/>
                    <b-img v-else src="empty_chess.png" fluid/>
                  </td>
                </tr>
              </table>
            </b-col>
            
            <b-col cols="12" class="mb-4 px-0 px-sm-3">
              <table v-for="u in [1, 2]" :key="u" class="mx-auto my-2">
                <tr v-for="i in [0, 1]" :key="i" class='board_row'>
                  <td 
                    v-for="j in [0, 1, 2, 3, 4, 5, 6, 7]" 
                    :key="j" 
                    class="cell p-0 p-sm-1" 
                  >
                    <b-img
                      v-if="gameRoomData[`user${u}Deaths`] && gameRoomData[`user${u}Deaths`][i*8+j]"
                      :src="`${gameRoomData[`user${u}Deaths`][i*8+j]}.png`"
                      fluid
                    />
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
                  v-for="(key, ind) in ['user1', 'user2']"
                  :key="ind"
                  cols="6"
                >
                  <div :class="{ panel: true, 'p-3': true, itsTurn: gameRoomData.turn===(ind+1) }">
                    <h5 :class="{ self_socket_id: gameRoomData[key]===$parent.socketId, 'text-truncate': true, 'subTitle': true }">
                      {{ userNameMap[gameRoomData[key]] || gameRoomData[key] }}
                    </h5>
                    <div>
                      {{ key==='user1'? '黑方': '紅方' }}：{{ gameRoomData[`${key}Total`] }}
                      {{ gameRoomData[`${key}Color`]==='b'? '黑方': gameRoomData[`${key}Color`]==='r'? '紅方': '顏色未定'  }}
                    </div>
                  </div>
                </b-col>
              </b-row>
            </b-col>

            <b-col cols="6" class="mb-4">
              <div class="panel p-3">
                <div>狀&emsp;態：{{ gameRoomData.status }}</div>
                <div>空&emsp;步：{{ gameRoomData.emptyMoving }} <small>（50步判和）</small></div>
                <div v-if="gameRoomData.prevI!==-1 && gameRoomData.prevJ!==-1">上一棋：{{ prevChessInfo }}</div>
                <div v-if="gameRoomData.turn===-1">贏&emsp;家：{{ winner }}</div>
              </div>
            </b-col>

            <b-col cols="6" class="mb-4">
              <div class="panel p-3">
                <b-button class="mx-2 fw-700" size="lg" @click="leaveWatchGame">
                  <fa :icon="['fas', 'sign-out-alt']" />&nbsp;離開
                </b-button>
              </div>
            </b-col>
          </b-row>

          <b-row class="px-3">
            <b-col cols="12" class="mt-2 mb-4">
              <h5 class="fw-900">房間聊天區 <small class="fw-700">（僅觀戰者可見）</small></h5>
            </b-col>
            <b-col cols="12" class="mb-4">
              <div class="panel p-3">
                <b-row align-v="center">
                  <b-col cols="12">
                    <b-form-textarea class="msgBox" :value="recvRoomMsg" rows="5" no-resize readonly />
                  </b-col>
                  <b-col class="mt-3">
                    <b-form-textarea v-model="sendRoomMsg" class="msgBox" type="text" placeholder="請輸入訊息" />
                  </b-col>
                  <b-col cols="auto" class="mt-3">
                    <b-button class="send-btn" @click="sendRoomMessage">
                      <fa :icon="['fas', 'paper-plane']" />
                    </b-button>
                  </b-col>
                </b-row>
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
const namespace = 'chineseDarkChess'
export default {
  data() {
    return {
      sendRoomMsg: '',
    }
  },
  computed: {
    ...mapGetters(namespace, ['userNameMap', 'gameRoomWatcherDialogShow', 'gameRoomData', 'recvRoomMsg']),
    show: {
      get() {
        return this.gameRoomWatcherDialogShow
      },
      set(_) {
        this.hideGameRoomWatcherDialog()
      },
    },
    winner() {
      if (this.gameRoomData.winner === -1) return '比賽未結束'
      else if (this.gameRoomData.winner === 0) return '平手'
      else if (this.gameRoomData.winner === 1) return '黑方'
      else return '紅方'
    },
    prevChessInfo() {
      const hIndex =  ['1', '2', '3', '4', '5', '6', '7', '8'];
      const vIndex = ['A', 'B', 'C', 'D']
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
    ...mapMutations(namespace, ['hideGameRoomWatcherDialog']),
    sendRoomMessage() {
      this.$parent.sendRoomMessage({ roomId: this.gameRoomData.id, msg: this.sendRoomMsg })
      this.sendRoomMsg = ""
    },
    leaveWatchGame() {
      this.$parent.leaveWatchGame(this.gameRoomData.id, this.hideGameRoomWatcherDialog)
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
  border-spacing: 3px;
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