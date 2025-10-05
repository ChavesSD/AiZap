<template>
  <div class="bot-page">
    <v-container fluid>
      <div class="development-message">
        <v-icon size="64" color="warning">mdi-robot</v-icon>
        <h1 class="page-title">Bot</h1>
        <p class="message">Página em desenvolvimento</p>
        <p class="sub-message">Esta funcionalidade será implementada em breve</p>
      </div>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'BotView'
}
</script>

<style scoped>
.bot-page {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.development-message {
  text-align: center;
  padding: 48px;
}

.page-title {
  color: #0c1b23;
  margin: 24px 0 16px 0;
  font-size: 28px;
  font-weight: 600;
}

.message {
  font-size: 18px;
  color: #666;
  margin: 0 0 8px 0;
}

.sub-message {
  font-size: 14px;
  color: #999;
  margin: 0;
}
</style>
