<template>
  <div id="app">
    <!-- 標題區 -->
    <header class="text-center pt-4 pb-0">
      <h1 class="fw-900">棋類遊戲</h1>
    </header>

    <!-- 內容區 -->
    <main class="container-fluid mb-3 py-3 py-md-5 px-3 px-sm-5">
      <b-row align-h="center">
        <b-col cols="12" md="8" lg="6" class="panel px-5 py-3">
          <b-button class="fw-700 py-4 my-4" size="lg" block :to="'reversi'">
            黑白棋 | Reversi
          </b-button>
          <b-button class="fw-700 py-4 my-4" size="lg" block :to="'chineseDarkChess'">
            中國暗棋 | Chinese Dark Chess
          </b-button>
        </b-col>
      </b-row>
    </main>

    <!-- 頁尾區 -->
    <footer>
      <b-row class="justify-content-center align-content-center pb-5">
        <b-col id="footer-panel" cols="12">
          <div class="card-body text-center">
            Linziyou <a
              class="text-dark text-decoration-none"
              href="https://github.com/linziyou0601/chess_games"
              data-size="large"
              aria-label="Star linziyou0601/chess_games on GitHub"
            >
              <fa :icon="['fab', 'github']" /> GitHub
            </a>
          </div>
        </b-col>
      </b-row>
    </footer>

    <LoadingDialog />
    <AlertDialog />
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: '棋類遊戲 | Chess Game',
    }
  },
}
</script>

<style>
@font-face {
  font-family: SweiGothicCJKtc;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Regular.woff2)
      format('woff2'),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Regular.woff)
      format('woff');
  font-weight: 400;
}
@font-face {
  font-family: SweiGothicCJKtc;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Medium.woff2)
      format('woff2'),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Medium.woff)
      format('woff');
  font-weight: 500;
}
@font-face {
  font-family: SweiGothicCJKtc;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Bold.woff2)
      format('woff2'),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Bold.woff)
      format('woff');
  font-weight: 700;
}
@font-face {
  font-family: SweiGothicCJKtc;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Black.woff2)
      format('woff2'),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Black.woff)
      format('woff');
  font-weight: 900;
}
.fw-900 { font-weight: 900 !important; }
.fw-700 { font-weight: 700 !important; }
.fw-500 { font-weight: 500 !important; }
.fw-400 { font-weight: 400 !important; }
.fw-300 { font-weight: 300 !important; }
.fw-200 { font-weight: 200 !important; }
.fw-100 { font-weight: 100 !important; }

/* -------------------- 字型 -------------------- */
html,
body {
  overflow-x: hidden;
  font-family: 'SweiGothicCJKtc', Helvetica, 'PingFang TC', '微軟正黑體',
    'Microsoft JhengHei', sans-serif !important;
  font-weight: 700;
  padding-right:0px !important;
  margin-right:0px !important;
  color: #333;
  background: #fffef9;
}

main {
  min-height: calc(100vh - 250px);
}

.panel {
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
  background: #ebe5de;
}
.panel .btn {
  background: #3d3a33;
  border: none;
  border-radius: 10px;
}
</style>