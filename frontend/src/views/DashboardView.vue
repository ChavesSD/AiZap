<template>
  <div class="dashboard-page">
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="dashboard-card" elevation="4">
            <v-card-text class="text-center pa-8">
              <v-icon size="64" color="primary" class="mb-4">mdi-view-dashboard</v-icon>
              <h1 class="page-title">Dashboard</h1>
              <p class="message">Página em desenvolvimento</p>
              <p class="sub-message">Esta funcionalidade será implementada em breve</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'DashboardView'
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dashboard-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.page-title {
  color: #0c1b23;
  margin: 24px 0 16px 0;
  font-size: 28px;
  font-weight: 700;
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
