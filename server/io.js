import axios from 'axios'
let busyUsers = {}
let gameRooms = {}
let userNameMap = {}

export default function (socket, io) {
  // 廣播目前使用者
  const broadcastUsers = () => {
    const sids = io.sockets.adapter.sids
    io.emit('updateUesrs', [...sids.keys()])
  }

  // 廣播目前使用者帳號MAP
  const broadcastUserNameMap = () => {
    io.emit('updateUserNameMap', userNameMap)
  }

  // 廣播更新排行榜
  const broadcastRanks = () => {
    io.emit('updateRanks')
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
    const gameRoom = gameRooms[roomId]
    if (gameRoom.status==='比賽中') {
      const win = leftUser===gameRoom.black? gameRoom.white: gameRoom.black
      const lose = leftUser===gameRoom.black? gameRoom.black: gameRoom.white
      io.in(roomId).emit('gameEnd', { 
        winner: leftUser===gameRoom.black? gameRoom.white: gameRoom.black, surrendered: true 
      })
      recordGameResult(win, lose, false)
    }
    io.in(roomId).emit('leaveTheRoom')
    delete busyUsers[gameRoom.black]
    delete busyUsers[gameRoom.white]
    if (gameRoom.black===roomId) io.in(gameRoom.white).socketsLeave(roomId)
    else io.in(gameRoom.black).socketsLeave(roomId)
    delete gameRooms[roomId]
  }

  // ---------------------------------------- 遊戲邏輯 ----------------------------------------//
  // 開局棋盤
  const initBoard =  [
    [0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,2,1,0,0,0],
    [0,0,0,1,2,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]
  ]
  // 八方位
  const directions = [
    [0, 1], [1, 1], [1, 0], [1, -1],      // 右, 右上, 上, 左上
    [0, -1], [-1, -1], [-1, 0], [-1, 1]   // 左, 左下, 下, 右下
  ]
  // 取得可下的位置
  const getAvailables = (board, chess) => {
    const match = (chess===1)? 2: 1
    const available = [
      [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0]
    ]
    for (let i in board) {
      for (let j in board[i]) {
        let flag = false
        if (board[i][j]===0) {
          // 遍歷八方位
          for (let dir of directions) {
            let tempI = +i + dir[0] // +前綴轉為數字
            let tempJ = +j + dir[1] // +前綴轉為數字
            // 若該方位延伸第一子為對手的棋子
            if (board[tempI]!==undefined && board[tempI][tempJ]===match) {
              do {
                tempI += dir[0]
                tempJ += dir[1]
                // 若找到自己的棋子
                if (board[tempI]!==undefined && board[tempI][tempJ]===chess) flag = true
              } while (board[tempI]!==undefined && board[tempI][tempJ]!==undefined && board[tempI][tempJ]===match)
              // 當下一顆未出界，且非自己的棋或空白棋的話，繼續找
            }
            if (flag) break
          }
          // 填入
          if (flag) available[i][j] = 1
        }
      }
    }
    return available
  }
  // 下棋並翻轉棋子
  const putAndReverseChess = (board, i, j, chess) => {
    const match = (chess===1)? 2: 1
    board[i][j] = chess
    // 遍歷八方位
    for (let dir of directions) {
      let tempI = +i + dir[0] // +前綴轉為數字
      let tempJ = +j + dir[1] // +前綴轉為數字
      // 若該方位延伸第一子為對手的棋子
      if (board[tempI]!==undefined && board[tempI][tempJ]===match) {
        let reversable = false
        let toBeReverses = [[tempI, tempJ]]
        do {
          tempI += dir[0]
          tempJ += dir[1]
          // 若找到自己的棋子
          if (board[tempI]!==undefined && board[tempI][tempJ]===chess) reversable = true
          else if (board[tempI]!==undefined && board[tempI][tempJ]===match) toBeReverses.push([tempI, tempJ])
        } while (board[tempI]!==undefined && board[tempI][tempJ]!==undefined && board[tempI][tempJ]===match)
        // 當下一顆未出界，且非自己的棋或空白棋的話，繼續找

        // 若該排可以翻轉，則翻轉
        if (reversable) {
          for (const tbr of toBeReverses) {
            board[tbr[0]][tbr[1]] = chess
          }
        }
      }
    }
    return board
  }
  // 取得目前總數
  const getTotalChessses = (board, chess) => {
    let sum = 0
    for (const row of board)
      for (const cell of row)
        if (cell===chess) sum+=1
    return sum
  }

  // 紀錄勝負至資料庫
  const recordGameResult = (winnerSocketId, loserSocketId, tie) => {
    // 紀錄 勝/平 方
    if (winnerSocketId in userNameMap) {
      axios.post(
        `${process.env._AXIOS_BASE_URL_}api/updateGameResult`, 
        { name: userNameMap[winnerSocketId], win: tie? 0: 1, lose: 0, tie: tie? 1: 0 }
      ).then((res)=> console.log(res.data))
    }
    // 紀錄 敗/平 方
    if (loserSocketId in userNameMap) {
      axios.post(
        `${process.env._AXIOS_BASE_URL_}api/updateGameResult`, 
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
    },
    // 斷線時
    disconnect(_) {
      broadcastUsers()
      broadcastUserNameMap()
    },
    // 斷線宣告發出時
    disconnecting(reason) {
      onUserLeft(socket.id)
      console.log(`Leave reason: ${reason}.`)
    },

    // 發送訊息
    sendMessage(msg) {
      io.emit('receiveMessage', `${userNameMap[socket.id] || socket.id} 說： ${msg}`)
    },

    // 發送邀請
    sendInvitation(user) {
      const inviter = socket.id
      if (!(user in busyUsers) && !(inviter in busyUsers)) {
        socket.to(user).emit('receiveInvitation', { inviter })
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
      socket.to(data.inviter).emit('replyInvitation')
      if (data.answer) {
        // 將user加入至inviter的房間
        io.in(data.user).socketsJoin(data.inviter)
        // 建立遊戲房間狀態
        const board = JSON.parse(JSON.stringify(initBoard));
        const roomId = data.inviter
        const gameRoomParams = {
          id: roomId,
          black: data.inviter,
          white: data.user,
          status: '比賽中',
          board,
          blackTotal: 2,
          whiteTotal: 2,
          turn: 1,
          winner: -1,
          available: getAvailables(board, 1)
        }
        gameRooms[roomId] = gameRoomParams
        // 將busy狀態紀錄改為房間id
        busyUsers[data.inviter] = roomId
        busyUsers[data.user] = roomId
        // 發送遊戲房間狀態
        io.in(roomId).emit('intoTheRoom', gameRoomParams)
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
      // 若位置正確
      if (gameRoom.available[data.i][data.j]===1) {
        // 下棋、翻轉棋子並計算棋數
        const nextBoard = putAndReverseChess(gameRoom.board, data.i, data.j, gameRoom.turn)
        const blackTotal = getTotalChessses(nextBoard, 1)
        const whiteTotal = getTotalChessses(nextBoard, 2)
        // 計算遊戲狀態
        let winner = -1
        let gameEnd = false
        let nextTurn = gameRoom.turn===1? 2: 1
        let available = getAvailables(nextBoard, nextTurn)
        // 若對手無棋可下
        if (getTotalChessses(available, 1)===0) {
          nextTurn = gameRoom.turn
          available = getAvailables(nextBoard, nextTurn)
          // 若自己也無棋可下
          if (getTotalChessses(available, 1)===0) {
            nextTurn = -1
            gameEnd = true
            winner = (blackTotal>whiteTotal)? 1: (blackTotal<whiteTotal)? 2: 0
          }
        }
        // 更新遊戲狀態
        const gameRoomParams = Object.assign(gameRoom, {
          status: gameEnd? '比賽結束': '比賽中',
          board: nextBoard,
          blackTotal,
          whiteTotal,
          turn: nextTurn,
          available,
          winner,
        })
        // 儲存並發送遊戲房間狀態
        gameRooms[data.roomId] = gameRoomParams
        io.in(data.roomId).emit('nextTurn', gameRoomParams)
        // 發送勝敗通知
        if (gameEnd) {
          if (winner!==0) {
            const win = winner===1? gameRoom.black: gameRoom.white
            const lose = winner===1? gameRoom.white: gameRoom.black
            io.in(data.roomId).emit('gameEnd', { winner: win, surrendered: false })
            recordGameResult(win, lose, false)
          } else {
            io.in(data.roomId).emit('gameEnd', { winner: '', surrendered: false })
            recordGameResult(gameRoom.black, gameRoom.white, true)
          }
        }
      }
    },
    // 離開房間
    leaveRoom(roomId) {
      onUserLeftRoom(roomId, socket.id)
    },
    // 投降
    surrender(roomId) {
      const gameRoom = gameRooms[roomId]
      const surrenderUser = socket.id
      const winner = (gameRoom.black===surrenderUser)? 2: 1
      // 更新遊戲狀態
      const gameRoomParams = Object.assign(gameRoom, {
        status: '比賽結束',
        turn: -1,
        winner,
      })
      // 儲存並發送遊戲房間狀態
      gameRooms[roomId] = gameRoomParams
      io.in(roomId).emit('nextTurn', gameRoomParams)
      // 發送勝敗通知
      const win = winner===1? gameRoom.black: gameRoom.white
      io.in(roomId).emit('gameEnd', { winner: win, surrendered: true })
      recordGameResult(win, surrenderUser, false)
    },
    // 再一場
    again(roomId) {
      const gameRoom = gameRooms[roomId]
      // 更新遊戲狀態
      const board = JSON.parse(JSON.stringify(initBoard));
      const gameRoomParams = {
        id: roomId,
        black: gameRoom.white,
        white: gameRoom.black,
        status: '比賽中',
        board,
        blackTotal: 2,
        whiteTotal: 2,
        turn: 1,
        winner: -1,
        available: getAvailables(board, 1)
      }
      // 儲存並發送遊戲房間狀態
      gameRooms[roomId] = gameRoomParams
      io.in(roomId).emit('nextTurn', gameRoomParams)
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
    }
  })
}
