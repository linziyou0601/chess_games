import axios from 'axios'
const namespace = 'chineseDarkChess'
let busyUsers = {}
let gameRooms = {}
let gameWatchers = {}
let userNameMap = {}

export default function (socket, io) {
  const chDarkChessNsp = io.of(`/${namespace}`)

  // 廣播目前使用者
  const broadcastRooms = () => {
    chDarkChessNsp.emit(`${namespace}/updateRooms`, gameRooms)
  }

  // 廣播目前使用者
  const broadcastUsers = () => {
    const sids = chDarkChessNsp.adapter.sids
    chDarkChessNsp.emit(`${namespace}/updateUesrs`, [...sids.keys()])
  }

  // 廣播目前使用者帳號MAP
  const broadcastUserNameMap = () => {
    chDarkChessNsp.emit(`${namespace}/updateUserNameMap`, userNameMap)
  }

  // 廣播更新排行榜
  const broadcastRanks = () => {
    chDarkChessNsp.emit(`${namespace}/updateRanks`)
  }

  // 廣播更新目前棋局
  const broadcastGameRooms = (roomId) => {
    Array.from(gameWatchers[roomId] || []).forEach((user) => {
      chDarkChessNsp.to(user).emit(`${namespace}/updateWatchingData`, gameRooms[roomId])
    })
  }

  // 廣播大廳訊息
  const broadcastMessage = (sender, msg) => {
    chDarkChessNsp.emit(`${namespace}/receiveMessage`, `${userNameMap[sender] || sender} 說： ${msg}`)
  }

  // 廣播房間訊息
  const broadcastRoomMessage = (sender, roomId, msg) => {
    Array.from(gameWatchers[roomId] || []).forEach((user) => {
      chDarkChessNsp.to(user).emit(`${namespace}/receiveRoomMessage`, `${userNameMap[sender] || sender} 說： ${msg}`)
    })
  }

  // 當使用者離線時
  const onUserLeft = (leftUser) => {
    const roomId = busyUsers[leftUser]
    if (roomId) {
      const gameRoom = gameRooms[roomId]
      if (gameRoom) onUserLeftRoom(roomId, leftUser)  // 若該User有在遊戲中
      else delete busyUsers[leftUserId]               // 若不在遊戲中
    }
    delete userNameMap[leftUser]
  }
  // 當使用者離開房間時
  const onUserLeftRoom = (roomId, leftUser) => {
    // 判定比賽結果
    const gameRoom = gameRooms[roomId]
    if (gameRoom.status==='比賽中') {
      const win = leftUser===gameRoom.user1? gameRoom.user2: gameRoom.user1
      const lose = leftUser===gameRoom.user1? gameRoom.user1: gameRoom.user2
      chDarkChessNsp.in(roomId).emit(`${namespace}/gameEnd`, {  winner: win, surrendered: true  })
      recordGameResult(win, lose, false)
    }

    // 處理線上使用者狀態
    chDarkChessNsp.in(roomId).emit(`${namespace}/leaveTheRoom`)
    Array.from(gameWatchers[roomId] || []).forEach((user) => {
      chDarkChessNsp.to(user).emit(`${namespace}/leaveTheRoom`)
    })
    delete busyUsers[gameRoom.user1]
    delete busyUsers[gameRoom.user2]
    if (gameRoom.user1===roomId) chDarkChessNsp.in(gameRoom.user2).socketsLeave(roomId)
    else chDarkChessNsp.in(gameRoom.user1).socketsLeave(roomId)
    delete gameRooms[roomId]

    //移除觀戰者
    Array.from(gameWatchers[roomId] || []).forEach((user) => {
      delete busyUsers[user]
    })
    delete gameWatchers[roomId]
    broadcastRooms()
  }

  // ---------------------------------------- 遊戲邏輯 ----------------------------------------//
  // 所有象棋
  const chessList = [
    'b1', 'b2', 'b2', 'b3', 'b3', 'b4', 'b4', 'b5', 'b5', 'b6', 'b6', 'b7', 'b7', 'b7', 'b7', 'b7',
    'r1', 'r2', 'r2', 'r3', 'r3', 'r4', 'r4', 'r5', 'r5', 'r6', 'r6', 'r7', 'r7', 'r7', 'r7', 'r7'
  ]
  // 開局棋盤狀態 0關 1開 2空
  const initStatusBoard =  [
    [0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]
  ]
  // 取得洗牌後的明棋
  const getRandomInitChessBoard = () => {
    const copiedChessList = JSON.parse(JSON.stringify(chessList));
    // Fisher–Yates shuffle
    for (let i = copiedChessList.length-1; i>0; i--){
      // random index
      const j = Math.floor( Math.random() * (i + 1) )
      // swap
      const temp = copiedChessList[i]
      copiedChessList[i] = copiedChessList[j]
      copiedChessList[j] = temp
    }
    // 放到棋盤裡
    const initChessBoard =  [
      ['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','','']
    ]
    for (const i in copiedChessList) initChessBoard[Math.trunc(i/8)][i%8] = copiedChessList[i]
    return initChessBoard
  }
  // 取得可下的位置
  const isMovable = (fromChess, toChess) => {
    if (fromChess.charAt(1)==='1' && toChess.charAt(1)==='7') return false
    else if (fromChess.charAt(1)<=toChess.charAt(1)) return true
    else if (fromChess.charAt(1)==='7' && toChess.charAt(1)==='1') return true
    else return false
  }

  // 紀錄勝負至資料庫
  const recordGameResult = (winnerSocketId, loserSocketId, tie) => {
    // 紀錄 勝/平 方
    if (winnerSocketId in userNameMap) {
      axios.post(
        `${process.env.BASE_URL || 'http://localhost:3000'}/api/ChineseDarkChess/updateGameResult`, 
        { name: userNameMap[winnerSocketId], win: tie? 0: 1, lose: 0, tie: tie? 1: 0 }
      ).then((res)=> console.log(res.data))
    }
    // 紀錄 敗/平 方
    if (loserSocketId in userNameMap) {
      axios.post(
        `${process.env.BASE_URL || 'http://localhost:3000'}/api/ChineseDarkChess/updateGameResult`, 
        { name: userNameMap[loserSocketId], win: 0, lose: tie? 0: 1, tie: tie? 1: 0 }
      ).then((res)=> console.log(res.data))
    }
    broadcastRanks()
  }
  
  return Object.freeze({
    // 連線完成時
    connected() {
      broadcastUsers()
      broadcastUserNameMap()
      broadcastRooms()
    },
    // 斷線時
    disconnect(_) {
      broadcastUsers()
      broadcastUserNameMap()
      broadcastRooms()
    },
    // 斷線宣告發出時
    disconnecting(reason) {
      onUserLeft(socket.id)
      console.log(`Leave reason: ${reason}.`)
    },

    // 發送訊息
    sendMessage(msg) {
      broadcastMessage(socket.id, msg)
    },

    // 發送邀請
    sendInvitation(user) {
      const inviter = socket.id
      if (!(user in busyUsers) && !(inviter in busyUsers)) {
        chDarkChessNsp.to(user).emit(`${namespace}/receiveInvitation`, { inviter })
        busyUsers[user] = 'UNDER_INVITATION'
        busyUsers[inviter] = 'UNDER_INVITATION'
        return { status: true }
      } else {
        return { status: false}
      }
    },
    // 回應邀請
    replyInvitation(data) {
      data.user = socket.id
      chDarkChessNsp.to(data.inviter).except(socket.id).emit(`${namespace}/repliedInvitation`)
      if (data.answer) {
        // 將user加入至inviter的房間
        chDarkChessNsp.in(data.user).socketsJoin(data.inviter)
        // 建立遊戲房間狀態
        const statusBoard = JSON.parse(JSON.stringify(initStatusBoard))
        const chessBoard = getRandomInitChessBoard()
        const roomId = data.inviter
        const gameRoomParams = {
          id: roomId,
          user1: data.inviter,
          user2: data.user,
          user1Color: '',
          user2Color: '',
          status: '比賽中',
          statusBoard,
          chessBoard,
          user1Deaths: [],
          user2Deaths: [],
          emptyMoving: 0,
          prevI: -1,
          prevJ: -1,
          turn: 1,
          winner: -1,
        }
        gameRooms[roomId] = gameRoomParams
        // 將busy狀態紀錄改為房間id
        busyUsers[data.inviter] = roomId
        busyUsers[data.user] = roomId
        // 發送遊戲房間狀態
        chDarkChessNsp.in(roomId).emit(`${namespace}/intoTheRoom`, gameRoomParams)
        broadcastRooms()
      } else {
        // 將user及inviter移除busy狀態
        delete busyUsers[data.inviter]
        delete busyUsers[data.user]
      }
      return { status: true }
    },
    // 下棋
    putChess(data) {
      const gameRoom = gameRooms[data.roomId]
      
      let winner = -1
      let gameEnd = false
      let nextTurn = gameRoom.turn===1? 2: 1

      // 計算遊戲狀態
      let user1Color = gameRoom.user1Color
      let user2Color = gameRoom.user2Color
      let emptyMove = false
      let emptyMoving = gameRoom.emptyMoving
      let nextStatusBoard = JSON.parse(JSON.stringify(gameRoom.statusBoard))
      let nextChessBoard = JSON.parse(JSON.stringify(gameRoom.chessBoard))
      let user1Deaths = JSON.parse(JSON.stringify(gameRoom.user1Deaths))
      let user2Deaths = JSON.parse(JSON.stringify(gameRoom.user2Deaths))

      const toBR = nextChessBoard[data.to.i][data.to.j].charAt(0)

      // 若from不存在，且to是關著的，打開它
      if (data.from===null) {
        nextStatusBoard[data.to.i][data.to.j] = 1
        if (user1Color==='' && user2Color==='') {
          user1Color = toBR
          user2Color = (user1Color==='b'? 'r': 'b')
        }
      } 
      // 檢查移動合不合法
      else {
        let validMove = false
        const fromChess = nextChessBoard[data.from.i][data.from.j]
        const toChess = nextChessBoard[data.to.i][data.to.j]
        // 非炮
        if (nextChessBoard[data.from.i][data.from.j].charAt(1)!=='6') {
          // 只移動 上、下、左、右 其中一格，且該格為空格或比該格大
          if (Math.abs(data.to.i - data.from.i) + Math.abs(data.to.j - data.from.j) === 1
              && (nextStatusBoard[data.to.i][data.to.j] === 2 || isMovable(fromChess, toChess))) {
            validMove = true
            emptyMove = (nextStatusBoard[data.to.i][data.to.j] === 2)
          }
        }
        // 炮
        else {
          // 只移動 上、下、左、右 其中一格且該格為空格
          if (Math.abs(data.to.i - data.from.i) + Math.abs(data.to.j - data.from.j) === 1
              && nextStatusBoard[data.to.i][data.to.j] === 2) {
            validMove = true
            emptyMove = true
          }
          // 只移動 橫且中間只跳過剛好一顆棋
          else if (Math.abs(data.to.i - data.from.i) === 0 || Math.abs(data.to.j - data.from.j) === 0) {
            let count = 0
            let tempI = data.from.i
            let tempJ = data.from.j
            const direction = [0, 0]
            if (data.to.i < data.from.i) direction[0] = -1
            if (data.to.i > data.from.i) direction[0] = 1
            if (data.to.j < data.from.j) direction[1] = -1
            if (data.to.j > data.from.j) direction[1] = 1
            // 當指到的棋不超出範圍，且還沒走到移動至的位置，計算數目
            do {
              tempI += direction[0]
              tempJ += direction[1]
              if ((nextStatusBoard[tempI] || [])[tempJ]!==undefined && nextStatusBoard[tempI][tempJ]!==2 
                  && (tempI!==data.to.i || tempJ!==data.to.j)) count++
            } while((nextStatusBoard[tempI] || [])[tempJ]!==undefined && (tempI!==data.to.i || tempJ!==data.to.j))
            console.log(`count: ${count}`)
            if (count===1) {
              validMove = true
              emptyMove = false
            }
          }
        }

        if (validMove) {
          if (!emptyMove) {
            if (toBR===user1Color) user1Deaths.push(nextChessBoard[data.to.i][data.to.j])
            else user2Deaths.push(nextChessBoard[data.to.i][data.to.j])
          }
          // 移動棋子
          nextChessBoard[data.to.i][data.to.j] = nextChessBoard[data.from.i][data.from.j]
          nextChessBoard[data.from.i][data.from.j] = ''
          // 移動棋子開關狀態
          nextStatusBoard[data.to.i][data.to.j] = 1
          nextStatusBoard[data.from.i][data.from.j] = 2
        } else {
          return { status: false }
        }
      }

      if (emptyMove) emptyMoving += 1
      else emptyMoving = 0
      
      // 若對手無棋可下
      if (user1Deaths.length===16 || user2Deaths.length===16) {
        nextTurn = -1
        gameEnd = true
        winner = user1Deaths.length===16? 2: 1
      } else if (emptyMoving>=50) {
        nextTurn = -1
        gameEnd = true
        winner = 0
      }

      // 更新遊戲狀態
      const gameRoomParams = Object.assign(gameRoom, {
        user1Color,
        user2Color,
        status: gameEnd? '比賽結束': '比賽中',
        statusBoard: nextStatusBoard,
        chessBoard: nextChessBoard,
        emptyMoving,
        prevI: data.to.i,
        prevJ: data.to.j,
        user1Deaths,
        user2Deaths,
        turn: nextTurn,
        winner,
      })
      // 儲存並發送遊戲房間狀態
      gameRooms[data.roomId] = gameRoomParams
      chDarkChessNsp.in(data.roomId).emit(`${namespace}/nextTurn`, gameRoomParams)
      broadcastGameRooms(data.roomId)
      // 發送勝敗通知
      if (gameEnd) {
        if (winner!==0) {
          const win = winner===1? gameRoom.user1: gameRoom.user2
          const lose = winner===1? gameRoom.user2: gameRoom.user1
          chDarkChessNsp.in(data.roomId).emit(`${namespace}/gameEnd`, { winner: win, surrendered: false })
          recordGameResult(win, lose, false)
        } else {
          chDarkChessNsp.in(data.roomId).emit(`${namespace}/gameEnd`, { winner: '', surrendered: false })
          recordGameResult(gameRoom.user1, gameRoom.user2, true)
        }
      }
      return { status: true }
    },
    // 離開房間
    leaveRoom(roomId) {
      onUserLeftRoom(roomId, socket.id)
    },
    // 投降
    surrender(roomId) {
      const gameRoom = gameRooms[roomId]
      const surrenderUser = socket.id
      const winner = (gameRoom.user1===surrenderUser)? 2: 1
      // 更新遊戲狀態
      const gameRoomParams = Object.assign(gameRoom, {
        status: '比賽結束',
        turn: -1,
        winner,
      })
      // 儲存並發送遊戲房間狀態
      gameRooms[roomId] = gameRoomParams
      chDarkChessNsp.in(roomId).emit(`${namespace}/nextTurn`, gameRoomParams)
      broadcastGameRooms(roomId)
      // 發送勝敗通知
      const win = winner===1? gameRoom.user1: gameRoom.user2
      chDarkChessNsp.in(roomId).emit(`${namespace}/gameEnd`, { winner: win, surrendered: true })
      recordGameResult(win, surrenderUser, false)
    },
    // 求和
    askTie(roomId) {
      const gameRoom = gameRooms[roomId]
      const user = socket.id===gameRoom.user1? gameRoom.user2: gameRoom.user1
      console.log(socket.id)
      console.log(user)
      chDarkChessNsp.to(user).emit(`${namespace}/receiveAskTie`, {user})
      return { status: true }
    },
    // 求和
    replyAskTie(data) {
      const roomId = data.roomId
      const gameRoom = gameRooms[roomId]
      const answer = data.answer
      const user = socket.id===gameRoom.user1? gameRoom.user2: gameRoom.user1
      chDarkChessNsp.to(user).emit(`${namespace}/repliedAskTie`)
      if (answer) {
        // 更新遊戲狀態
        const gameRoomParams = Object.assign(gameRoom, {
          status: '比賽結束',
          turn: -1,
          winner: 0,
        })
        // 儲存並發送遊戲房間狀態
        gameRooms[roomId] = gameRoomParams
        chDarkChessNsp.in(roomId).emit(`${namespace}/nextTurn`, gameRoomParams)
        broadcastGameRooms(roomId)
        // 發送勝敗通知
        chDarkChessNsp.in(roomId).emit(`${namespace}/gameEnd`, { winner: '', surrendered: false })
        recordGameResult(gameRoom.user1, gameRoom.user2, true)
      }
      return { status: true }
    },
    // 再一場
    again(roomId) {
      const gameRoom = gameRooms[roomId]
      // 更新遊戲狀態
      const statusBoard = JSON.parse(JSON.stringify(initStatusBoard))
      const chessBoard = getRandomInitChessBoard()
      const gameRoomParams = {
        id: roomId,
        user1: gameRoom.user2,
        user2: gameRoom.user1,
        user1Color: '',
        user2Color: '',
        status: '比賽中',
        statusBoard,
        chessBoard,
        user1Deaths: [],
        user2Deaths: [],
        emptyMoving: 0,
        prevI: -1,
        prevJ: -1,
        turn: 1,
        winner: -1,
      }
      // 儲存並發送遊戲房間狀態
      gameRooms[roomId] = gameRoomParams
      chDarkChessNsp.in(roomId).emit(`${namespace}/nextTurn`, gameRoomParams)
      broadcastGameRooms(roomId)
    },

    // 紀錄使用者名稱
    recordUserName(userName) {
      if (Object.values(userNameMap).includes(userName)) return { duplicated: true }
      else {
        userNameMap[socket.id] = userName
        broadcastUserNameMap()
        broadcastRanks()
        return { duplicated: false }
      }
    },

    // 觀戰
    intoWatchGame(roomId) {
      if (!(roomId in gameWatchers)) gameWatchers[roomId] = new Set()
      gameWatchers[roomId].add(socket.id)
      busyUsers[socket.id] = 'WATCHING_GAME'
      broadcastGameRooms(roomId)
    },
    // 離開觀戰
    leaveWatchGame(roomId) {
      if (roomId in gameWatchers)
        gameWatchers[roomId].delete(socket.id)
      delete busyUsers[socket.id]
      return { status: true }
    },
    // 發送房間訊息
    sendRoomMessage(data) {
      broadcastRoomMessage(socket.id, data.roomId, data.msg)
    },
  })
}
