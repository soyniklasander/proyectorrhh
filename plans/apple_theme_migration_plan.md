# Plan de Migración a Apple Theme

## Visión General
Actualizar TODAS las vistas restantes del proyecto al nuevo sistema de diseño Apple Components.

## Vistas Ya Actualizadas ✓
- Dashboard.vue ✓
- PersonalList.vue ✓
- employees/index.vue ✓
- contracts/index.vue ✓
- time/index.vue ✓
- time/AttendanceList.vue ✓
- time/OvertimeList.vue ✓
- time/VacationsList.vue ✓
- time/PermitsList.vue ✓
- payroll/index.vue ✓
- PayrollList.vue ✓

## Vistas Pendientes de Actualizar

### Fase 1: Personal & Empleados
1. [ ] personal/index.vue
2. [ ] personal/ContractsList.vue
3. [ ] personal/LiquidacionesList.vue
4. [ ] personal/LiquidationForm.vue
5. [ ] personal/OnboardingWizard.vue
6. [ ] personal/PlantillasDocumentos.vue
7. [ ] personal/DocumentosList.vue
8. [ ] personal/DocumentosTable.vue
9. [ ] personal/DesvinculacionList.vue
10. [ ] personal/DocumentosSalida.vue

### Fase 2: Nómina (Complemento)
11. [ ] payroll/PayslipsList.vue
12. [ ] payroll/BenefitsList.vue
13. [ ] payroll/PayrollRun.vue
14. [ ] payroll/discounts/index.vue
15. [ ] payroll/liquidations/index.vue
16. [ ] payroll/loans/index.vue
17. [ ] payroll/payslips/index.vue

### Fase 3: Tiempo y Gestión
18. [ ] overtime/index.vue
19. [ ] leaves/index.vue
20. [ ] loans/index.vue
21. [ ] time/OvertimeImport.vue
22. [ ] time/OvertimeReview.vue
23. [ ] time/OvertimeSettings.vue

### Fase 4: Administración
24. [ ] reports/index.vue
25. [ ] settings/index.vue
26. [ ] auth/Login.vue
27. [ ] admin/Companies.vue
28. [ ] admin/users/index.vue
29. [ ] admin/audit/index.vue
30. [ ] admin/companies/ (sub-vistas)

### Fase 5: Legal y Tax
31. [ ] legal/afp/index.vue
32. [ ] legal/concepts/index.vue
33. [ ] legal/essalud/index.vue
34. [ ] legal/regimens/index.vue
35. [ ] legal/templates/index.vue
36. [ ] tax/mintra/index.vue
37. [ ] tax/sunat/index.vue

### Fase 6: Páginas Generales
38. [ ] NotFound.vue

## Componentes Apple Disponibles
- AppleContainer
- ApplePageHeader
- AppleCard
- AppleButton
- AppleTable
- AppleTag
- AppleBadge
- AppleAvatar
- AppleInput
- AppleSelect
- AppleSearchInput
- AppleModal
- AppleTabs
- AppleGrid
- AppleStatCard
- AppleCardSection
- AppleDivider
- AppleIconButton
- AppleButtonGroup
- AppleTimeline
- AppleSkeleton
- AppleLoading
- AppleEmptyState
- AppleAlert
- AppleDatePicker

## Patrón de Conversión

### Antes (naive-ui):
```vue
<template>
  <div class="page-container">
    <PageHeader title="Título" subtitle="Subtítulo">
      <template #extra>
        <n-button type="primary">Nuevo</n-button>
      </template>
    </PageHeader>
    <n-card>
      <n-data-table :columns="columns" :data="data" />
    </n-card>
  </div>
</template>
```

### Después (Apple):
```vue
<template>
  <AppleContainer>
    <ApplePageHeader title="Título" subtitle="Subtítulo">
      <template #actions>
        <AppleButton variant="primary">Nuevo</AppleButton>
      </template>
    </ApplePageHeader>
    <AppleCard>
      <AppleTable :columns="columns" :data="data" :bordered="false" :striped="true" />
    </AppleCard>
  </AppleContainer>
</template>
```

## Reglas de Conversión

### Componentes Base
| naive-ui | Apple |
|----------|-------|
| PageHeader | ApplePageHeader |
| n-card | AppleCard |
| n-button | AppleButton |
| n-tag | AppleTag |
| n-badge | AppleBadge |
| n-avatar | AppleAvatar |
| n-input | AppleInput / HTML input |
| n-select | AppleSelect |
| n-data-table | AppleTable |
| n-tabs | AppleTabs |
| n-modal | AppleCard + v-if overlay |
| n-descriptions | AppleCardSection |

### Imports
```typescript
import {
  AppleContainer,
  ApplePageHeader,
  AppleCard,
  AppleButton,
  AppleTable,
  AppleTag,
  AppleBadge,
  AppleAvatar,
  AppleInput,
  AppleSelect,
  AppleTabs,
  // ... otros según necesidad
} from '@/components/apple'
```

### Atributos de Botones
| naive-ui | Apple |
|----------|-------|
| type="primary" | variant="primary" |
| type="secondary" | variant="secondary" |
| type="success" | variant="success" |
| type="warning" | variant="secondary" + estilo |
| type="error" | variant="danger" |
| ghost | variant="ghost" |

### Tags de Estado
| naive-ui | Apple |
|----------|-------|
| type="success" | type="success" |
| type="warning" | type="warning" |
| type="error" | type="error" |
| type="info" | type="primary" |
| type="default" | type="default" |

## Siguiente Paso
Ejecutar la migración por fases, comenzando con las vistas más utilizadas.
