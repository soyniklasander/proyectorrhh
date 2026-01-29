<template>
  <div class="page-not-found">
    <n-result
      status="404"
      title="Página No Encontrada"
      description="La página que buscas no existe o ha sido movida."
    >
      <template #footer>
        <n-space>
          <n-button @click="$router.go(-1)">Volver</n-button>
          <n-button type="primary" @click="$router.push('/')">Ir al Inicio</n-button>
        </n-space>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
// No se necesita lógica para esta página
</script>

<style scoped>
.page-not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}
</style>